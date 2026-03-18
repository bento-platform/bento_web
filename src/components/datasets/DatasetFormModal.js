import { useCallback } from "react";
import PropTypes from "prop-types";

import { Button, Form, Modal } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";

import DatasetForm from "./DatasetForm";

import { FORM_MODE_ADD } from "@/constants";
import { addProjectDataset, saveProjectDataset, fetchProjectsWithDatasets } from "@/modules/metadata/actions";
import { useProjects } from "@/modules/metadata/hooks";
import { datasetPropTypesShape, projectPropTypesShape, propTypesFormMode } from "@/propTypes";
import { nop } from "@/utils/misc";
import { useAppDispatch } from "@/store";

const DatasetFormModal = ({ project, mode, initialValue, onCancel, onOk, open }) => {
  const dispatch = useAppDispatch();

  const {
    isFetching: projectsFetching,
    isAddingDataset: projectDatasetsAdding,
    isSavingDataset: projectDatasetsSaving,
  } = useProjects();

  const [form] = Form.useForm();

  const handleSuccess = useCallback(
    async (values) => {
      await dispatch(fetchProjectsWithDatasets()); // TODO: If needed / only this project...
      await (onOk || nop)({ ...(initialValue || {}), values });
      form.resetFields();
    },
    [dispatch, form, initialValue, onOk],
  );

  const handleCancel = useCallback(() => {
    (onCancel || nop)();
    form.resetFields();
  }, [form, onCancel]);

  // Triggered by the modal's Save button; delegates validation + transformation
  // to DatasetForm's onFinish via form.submit().
  const handleSubmit = useCallback(() => {
    form.submit();
  }, [form]);

  // Receives the Zod-validated, transformed data from DatasetForm's onFinish.
  const handleDatasetSubmit = useCallback(
    (values) => {
      const onSuccess = () => handleSuccess(values);
      return mode === FORM_MODE_ADD
        ? dispatch(addProjectDataset(project, values, onSuccess))
        : dispatch(
            saveProjectDataset(
              {
                ...(initialValue || {}),
                project: project.identifier,
                ...values,
              },
              onSuccess,
            ),
          );
    },
    [dispatch, handleSuccess, mode, project, initialValue],
  );

  if (!project) return null;
  return (
    <Modal
      open={open}
      width={848}
      title={
        mode === FORM_MODE_ADD ? `Add Dataset to "${project.title}"` : `Edit Dataset "${initialValue?.title || ""}"`
      }
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="save"
          icon={mode === FORM_MODE_ADD ? <PlusOutlined /> : <SaveOutlined />}
          type="primary"
          onClick={handleSubmit}
          loading={projectsFetching || projectDatasetsAdding || projectDatasetsSaving}
        >
          {mode === FORM_MODE_ADD ? "Add" : "Save"}
        </Button>,
      ]}
      onCancel={handleCancel}
    >
      <DatasetForm
        form={form}
        onSubmit={handleDatasetSubmit}
        initialValues={mode === FORM_MODE_ADD ? undefined : initialValue}
      />
    </Modal>
  );
};

DatasetFormModal.propTypes = {
  mode: propTypesFormMode.isRequired,
  initialValue: datasetPropTypesShape,

  onOk: PropTypes.func,
  onCancel: PropTypes.func,

  project: projectPropTypesShape,

  open: PropTypes.bool,
};

export default DatasetFormModal;
