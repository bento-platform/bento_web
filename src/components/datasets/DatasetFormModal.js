import { useCallback } from "react";
import PropTypes from "prop-types";

import { Button, Form, Modal, Upload, message } from "antd";
import { PlusOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";

import { prepareInitialValues } from "./DatasetForm/helpers";

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

  const handleJsonUpload = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          form.setFieldsValue(prepareInitialValues(parsed));
          message.success("JSON imported — review the fields before saving.");
        } catch {
          message.error("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
      return false; // prevent antd auto-upload
    },
    [form],
  );

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
        <Upload key="import" accept=".json" showUploadList={false} beforeUpload={handleJsonUpload}>
          <Button icon={<UploadOutlined />}>Import JSON</Button>
        </Upload>,
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
