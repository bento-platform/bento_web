import { useCallback } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Form, Modal } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";

import DatasetForm from "./DatasetForm";

import { FORM_MODE_ADD } from "@/constants";
import { addProjectDataset, saveProjectDataset, fetchProjectsWithDatasets } from "@/modules/metadata/actions";
import { useProjects } from "@/modules/metadata/hooks";
import { datasetPropTypesShape, projectPropTypesShape, propTypesFormMode } from "@/propTypes";
import { nop } from "@/utils/misc";

const DatasetFormModal = ({ project, mode, initialValue, onCancel, onOk, open }) => {
  const dispatch = useDispatch();

  const {
    isFetching: projectsFetching,
    isAddingDataset: projectDatasetsAdding,
    isSavingDataset: projectDatasetsSaving,
  } = useProjects();

  // const formRef = useRef(null);
  const [form] = Form.useForm();

  const handleSuccess = useCallback(
    async (values) => {
      await dispatch(fetchProjectsWithDatasets()); // TODO: If needed / only this project...
      await (onOk || nop)({ ...(initialValue || {}), values });
      if (mode === FORM_MODE_ADD) form.resetFields();
    },
    [dispatch, form, initialValue, mode, onOk],
  );

  const handleCancel = useCallback(() => (onCancel || nop)(), [onCancel]);
  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        const onSuccess = () => handleSuccess(values);

        if (typeof values?.discovery === "string") {
          values["discovery"] = JSON.parse(values["discovery"]);
        }

        return mode === FORM_MODE_ADD
          ? dispatch(addProjectDataset(project, values, onSuccess))
          : dispatch(
              saveProjectDataset(
                {
                  ...(initialValue || {}),
                  project: project.identifier,
                  ...values,
                  description: (values.description || "").trim(),
                  contact_info: (values.contact_info || "").trim(),
                },
                onSuccess,
              ),
            );
      })
      .catch((err) => {
        console.error(err);
      });
  }, [dispatch, form, handleSuccess, mode, project, initialValue]);

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
      <DatasetForm form={form} initialValue={mode === FORM_MODE_ADD ? undefined : initialValue} />
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
