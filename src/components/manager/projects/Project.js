import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Col, Empty, Form, Space, Typography } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PartitionOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { createDataset, deleteProject, editProject, makeProjectResource, RESOURCE_EVERYTHING } from "bento-auth-js";

import { INITIAL_DATA_USE_VALUE } from "@/duo";
import { useHasResourcePermissionWrapper, useResourcePermissionsWrapper } from "@/hooks";
import { projectPropTypesShape } from "@/propTypes";
import { nop, simpleDeepCopy } from "@/utils/misc";
import Dataset from "@/components/datasets/Dataset";

import ProjectForm from "./ProjectForm";
import ProjectExtraPropertiesModal from "@/components/manager/projects/ProjectExtraPropertiesModal";

const Project = ({
  value,
  saving,
  editing,
  onAddDataset,
  onEditDataset,
  onAddJsonSchema,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) => {
  const resource = makeProjectResource(value.identifier);

  // Project deletion is a permission on the node, so we need these permissions for that purpose.
  const { hasPermission: canDeleteProject, fetchingPermission: isFetchingGlobalPermissions } =
    useHasResourcePermissionWrapper(RESOURCE_EVERYTHING, deleteProject);

  // Project editing/dataset creation is a permission on the project, so we need these permissions for those purposes.
  const { permissions: projectPermissions, isFetchingPermissions: isFetchingProjectPermissions } =
    useResourcePermissionsWrapper(resource);

  const canEditProject = useMemo(() => projectPermissions.includes(editProject), [projectPermissions]);
  const canCreateDataset = useMemo(() => projectPermissions.includes(createDataset), [projectPermissions]);

  const [projectState, setProjectState] = useState({
    identifier: value.identifier,
    title: value.title,
    description: value.description,
    datasets: value.datasets || [],
    project_schemas: value.project_schemas || [],
    discovery: value.discovery || {},
  });

  const [editingForm] = Form.useForm();

  const [isExtraPropertyModalOpen, setIsExtraPropertyModalOpen] = useState(false);

  useEffect(() => {
    if (value) {
      setProjectState((ps) => ({
        ...ps,
        ...value,
        data_use: simpleDeepCopy(value.data_use || INITIAL_DATA_USE_VALUE),
      }));
    }
  }, [value]);

  const handleSave = useCallback(async () => {
    try {
      const values = await editingForm.validateFields();
      await onSave({
        identifier: projectState.identifier,
        title: values.title || projectState.title,
        description: values.description || projectState.description,
        data_use: values.data_use || projectState.data_use,
        discovery: values.discovery, // discovery is nullable, so no projectState fallback
      });
      editingForm.resetFields();
    } catch (err) {
      console.log(err);
    }
  }, [editingForm, onSave, projectState]);

  const handleCancelEdit = useCallback(() => {
    editingForm.resetFields();
    (onCancelEdit || nop)();
  }, [editingForm, onCancelEdit]);

  return (
    <>
      <div style={{ position: "absolute", top: "24px", right: "24px" }}>
        {editing ? (
          <>
            <Button type="primary" icon={<CheckOutlined />} loading={saving} onClick={() => handleSave()}>
              Save
            </Button>
            <Button
              icon={<CloseOutlined />}
              style={{ marginLeft: "10px" }}
              disabled={saving}
              onClick={() => handleCancelEdit()}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Space>
            <Button
              icon={<PlusOutlined />}
              loading={isFetchingProjectPermissions}
              disabled={!canCreateDataset}
              onClick={() => (onAddDataset || nop)()}
            >
              Add Dataset
            </Button>
            <Button
              icon={<PartitionOutlined />}
              loading={isFetchingProjectPermissions}
              onClick={() => setIsExtraPropertyModalOpen(true)}
            >
              Extra Properties
            </Button>
            <Button
              icon={<EditOutlined />}
              loading={isFetchingProjectPermissions}
              disabled={!canEditProject}
              onClick={() => (onEdit || nop)()}
            >
              Edit
            </Button>
            <Button
              danger={true}
              icon={<DeleteOutlined />}
              loading={isFetchingGlobalPermissions}
              disabled={!canDeleteProject}
              onClick={() => (onDelete || nop)()}
            >
              Delete
            </Button>
          </Space>
        )}
      </div>
      {editing ? (
        <ProjectForm
          form={editingForm}
          style={{ maxWidth: "600px" }}
          initialValues={{
            title: projectState.title,
            description: projectState.description,
            data_use: projectState.data_use,
            discovery: projectState.discovery,
          }}
        />
      ) : (
        <>
          <Typography.Title level={2} style={{ marginTop: 0 }}>
            {projectState.title}
          </Typography.Title>
          {projectState.description.split("\n").map((p, i) => (
            <Typography.Paragraph key={i} style={{ maxWidth: "600px" }}>
              {p}
            </Typography.Paragraph>
          ))}
        </>
      )}

      {(projectState.datasets || []).length > 0 ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {projectState.datasets
            .sort((d1, d2) => d1.title.localeCompare(d2.title))
            .map((d) => (
              <Col span={24} key={d.identifier}>
                <Dataset
                  key={d.identifier}
                  mode="private"
                  project={value}
                  value={d}
                  onEdit={() => (onEditDataset || nop)(d)}
                />
              </Col>
            ))}
        </Space>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Datasets">
          <Button
            icon={<PlusOutlined />}
            loading={isFetchingProjectPermissions}
            disabled={!canEditProject}
            onClick={onAddDataset || nop}
          >
            Add Dataset
          </Button>
        </Empty>
      )}

      <ProjectExtraPropertiesModal
        open={isExtraPropertyModalOpen}
        loading={isFetchingProjectPermissions}
        onCancel={() => setIsExtraPropertyModalOpen(false)}
        projectState={projectState}
        canEditProject={canEditProject}
        onAddJsonSchema={onAddJsonSchema}
      />
    </>
  );
};

Project.propTypes = {
  value: projectPropTypesShape.isRequired,

  editing: PropTypes.bool,
  saving: PropTypes.bool,

  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onCancelEdit: PropTypes.func,
  onSave: PropTypes.func,
  onAddDataset: PropTypes.func,
  onEditDataset: PropTypes.func,
  onAddJsonSchema: PropTypes.func,
};

export default Project;
