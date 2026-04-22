import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { Alert, Button, Form, Modal, Space, Upload, message } from "antd";
import { PlusOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";

import { prepareInitialValues } from "./DatasetForm/helpers";

import DatasetForm from "./DatasetForm";

import { FORM_MODE_ADD, FORM_MODE_EDIT } from "@/constants";
import { addProjectDataset, saveProjectDataset, fetchProjectsWithDatasets } from "@/modules/metadata/actions";
import { useProjects } from "@/modules/metadata/hooks";
import { datasetPropTypesShape, projectPropTypesShape, propTypesFormMode } from "@/propTypes";
import { nop } from "@/utils/misc";
import { useAppDispatch } from "@/store";
import { saveDraft, loadDraft, clearDraft, deserializeFormValues } from "@/utils/datasetDraftUtils";

const DatasetFormModal = ({ project, mode, initialValue, onCancel, onOk, open }) => {
  const dispatch = useAppDispatch();

  const {
    isFetching: projectsFetching,
    isAddingDataset: projectDatasetsAdding,
    isSavingDataset: projectDatasetsSaving,
  } = useProjects();

  const [form] = Form.useForm();
  const [draftBanner, setDraftBanner] = useState(null);
  const debounceTimer = useRef(null);

  const draftKey =
    mode === FORM_MODE_ADD
      ? `dataset-draft:add:${project?.identifier}`
      : `dataset-draft:edit:${initialValue?.identifier}`;

  useEffect(() => {
    if (!open) return;
    const draft = loadDraft(draftKey);
    if (draft) setDraftBanner({ savedAt: draft.savedAt });
    else setDraftBanner(null);
  }, [open, draftKey]);

  const handleValuesChange = useCallback(
    (_changedValues, allValues) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => saveDraft(draftKey, allValues), 1000);
    },
    [draftKey],
  );

  const handleRestore = useCallback(() => {
    const draft = loadDraft(draftKey);
    if (!draft) return;
    form.setFieldsValue(deserializeFormValues(draft.values));
    setDraftBanner(null);
  }, [draftKey, form]);

  const handleDiscard = useCallback(() => {
    clearDraft(draftKey);
    setDraftBanner(null);
  }, [draftKey]);

  const handleSuccess = useCallback(
    async (values) => {
      await dispatch(fetchProjectsWithDatasets()); // TODO: If needed / only this project...
      await (onOk || nop)({ ...(initialValue || {}), values });
      clearDraft(draftKey);
      form.resetFields();
    },
    [dispatch, draftKey, form, initialValue, onOk],
  );

  const handleCancel = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
      // Flush: user closed before the debounce fired, save immediately so draft survives
      saveDraft(draftKey, form.getFieldsValue(true));
    }
    setDraftBanner(null);
    (onCancel || nop)();
    form.resetFields();
  }, [draftKey, form, onCancel]);

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
      footer={
        <Space>
          <Upload key="import" accept=".json" showUploadList={false} beforeUpload={handleJsonUpload}>
            <Button icon={<UploadOutlined />}>Import JSON</Button>
          </Upload>
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            key="save"
            icon={mode === FORM_MODE_ADD ? <PlusOutlined /> : <SaveOutlined />}
            type="primary"
            onClick={handleSubmit}
            loading={projectsFetching || projectDatasetsAdding || projectDatasetsSaving}
          >
            {mode === FORM_MODE_ADD ? "Add" : "Save"}
          </Button>
        </Space>
      }
      onCancel={handleCancel}
    >
      {draftBanner && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="You have unsaved progress from this form"
          description={`Last saved: ${new Date(draftBanner.savedAt).toLocaleString()}`}
          action={
            <Space>
              <Button size="small" type="primary" onClick={handleRestore}>
                Restore
              </Button>
              <Button size="small" onClick={handleDiscard}>
                Discard
              </Button>
            </Space>
          }
        />
      )}
      <DatasetForm
        form={form}
        onSubmit={handleDatasetSubmit}
        initialValues={mode === FORM_MODE_ADD ? undefined : initialValue}
        onValuesChange={handleValuesChange}
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
