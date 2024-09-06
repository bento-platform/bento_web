import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Form, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import ProjectForm from "./ProjectForm";

import { toggleProjectCreationModal } from "@/modules/manager/actions";
import { createProjectIfPossible } from "@/modules/metadata/actions";
import { useProjects } from "@/modules/metadata/hooks";
import { useAppDispatch, useAppSelector } from "@/store";

const ProjectCreationModal = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const showCreationModal = useAppSelector((state) => state.manager.projectCreationModal);
  const isCreatingProject = useProjects().isCreating;

  const handleCreateCancel = useCallback(() => {
    form.resetFields();
    dispatch(toggleProjectCreationModal());
  }, [form, dispatch]);

  const handleCreateSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await dispatch(createProjectIfPossible(values, navigate));
      form.resetFields();
      dispatch(toggleProjectCreationModal());
    } catch (err) {
      console.error(err);
    }
  }, [form, dispatch, navigate]);

  return (
    <Modal
      open={showCreationModal}
      title="Create Project"
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCreateCancel}>
          Cancel
        </Button>,
        <Button
          key="create"
          icon={<PlusOutlined />}
          type="primary"
          onClick={handleCreateSubmit}
          loading={isCreatingProject}
        >
          Create
        </Button>,
      ]}
      onCancel={handleCreateCancel}
    >
      <ProjectForm form={form} />
    </Modal>
  );
};

export default ProjectCreationModal;
