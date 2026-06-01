import { useCallback, useState } from "react";
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

import { useHasResourcePermissionWrapper, useResourcePermissionsWrapper } from "@/hooks";
import { projectPropTypesShape } from "@/propTypes";
import { nop } from "@/utils/misc";
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

  const canEditProject = projectPermissions.includes(editProject);
  const canCreateDataset = projectPermissions.includes(createDataset);

  const [editingForm] = Form.useForm();
  const [isExtraPropertyModalOpen, setIsExtraPropertyModalOpen] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      const values = await editingForm.validateFields();
      await onSave({
        identifier: value.identifier,
        title: values.title || value.title,
        description: values.description || value.description,
        data_use: values.data_use || value.data_use,
        discovery: values.discovery, // discovery is nullable, so no value fallback
      });
      editingForm.resetFields();
    } catch (err) {
      console.log(err);
    }
  }, [editingForm, onSave, value]);

  const handleCancelEdit = useCallback(() => {
    editingForm.resetFields();
    (onCancelEdit || nop)();
  }, [editingForm, onCancelEdit]);

  const datasets = value.datasets_v2 ?? [];

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
            title: value.title,
            description: value.description,
            data_use: value.data_use,
            discovery: value.discovery,
          }}
        />
      ) : (
        <>
          <Typography.Title level={2} style={{ marginTop: 0 }}>
            {value.title}
          </Typography.Title>
          {value.description.split("\n").map((p, i) => (
            <Typography.Paragraph key={i} style={{ maxWidth: "600px" }}>
              {p}
            </Typography.Paragraph>
          ))}
        </>
      )}

      {datasets.length > 0 ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {[...datasets]
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
        projectState={value}
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
