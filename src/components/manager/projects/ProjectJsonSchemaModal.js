import { useCallback } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Form, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { createProjectJsonSchema } from "@/modules/metadata/actions";
import { useProjectJsonSchemaTypes } from "@/modules/metadata/hooks";

import ProjectJsonSchemaForm from "./ProjectJsonSchemaForm";

const ProjectJsonSchemaModal = ({ projectId, open, onOk, onCancel }) => {
  const dispatch = useDispatch();

  const { isFetchingExtraPropertiesSchemaTypes, isCreatingJsonSchema, extraPropertiesSchemaTypes } =
    useProjectJsonSchemaTypes();

  const [form] = Form.useForm();

  const cancelReset = useCallback(() => {
    form.resetFields();
    onCancel();
  }, [form, onCancel]);

  const handleCreateSubmit = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);

        const payload = {
          project: projectId,
          schemaType: values.schemaType,
          required: values.required,
          jsonSchema: values.jsonSchema,
        };

        return dispatch(createProjectJsonSchema(payload)).then(() => {
          form.resetFields();
          onOk();
        });
      })
      .catch((err) => console.error(err));
  }, [dispatch, form, projectId, onOk]);

  return (
    <Modal
      open={open}
      width={648}
      title="Create project level JSON schema"
      styles={{
        body: {
          overflowY: "auto",
          maxHeight: 800,
        },
      }}
      onCancel={cancelReset}
      footer={[
        <Button key="cancel" onClick={cancelReset}>
          Cancel
        </Button>,
        <Button
          key="create"
          icon={<PlusOutlined />}
          type="primary"
          onClick={handleCreateSubmit}
          loading={isCreatingJsonSchema || isFetchingExtraPropertiesSchemaTypes}
          disabled={!extraPropertiesSchemaTypes || Object.keys(extraPropertiesSchemaTypes).length === 0}
        >
          Create
        </Button>,
      ]}
    >
      <ProjectJsonSchemaForm form={form} schemaTypes={extraPropertiesSchemaTypes || {}} initialValues={{}} />
    </Modal>
  );
};

ProjectJsonSchemaModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  open: PropTypes.bool,

  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ProjectJsonSchemaModal;
