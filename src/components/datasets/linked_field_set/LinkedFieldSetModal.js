import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Form, Modal } from "antd";

import LinkedFieldSetForm from "./LinkedFieldSetForm";

import { FORM_MODE_ADD } from "@/constants";
import { addDatasetLinkedFieldSetIfPossible, saveDatasetLinkedFieldSetIfPossible } from "@/modules/metadata/actions";
import { datasetPropTypesShape, linkedFieldSetPropTypesShape, propTypesFormMode } from "@/propTypes";
import { nop } from "@/utils/misc";

const LinkedFieldSetModal = ({ dataset, linkedFieldSetIndex, linkedFieldSet, mode, open, onCancel, onSubmit }) => {
  const dispatch = useDispatch();

  const [form] = Form.useForm();

  const dataTypes = useSelector((state) => state.serviceDataTypes.itemsByID);
  const isSavingDataset = useSelector((state) => state.projects.isSavingDataset);

  const addLinkedFieldSet = useCallback(
    (newLinkedFieldSet, onSuccess) =>
      dispatch(addDatasetLinkedFieldSetIfPossible(dataset, newLinkedFieldSet, onSuccess)),
    [dispatch, dataset],
  );

  const saveLinkedFieldSet = useCallback(
    (newLinkedFieldSet, onSuccess) =>
      dispatch(saveDatasetLinkedFieldSetIfPossible(dataset, linkedFieldSetIndex, newLinkedFieldSet, onSuccess)),
    [dispatch, dataset, linkedFieldSetIndex],
  );

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async (values) => {
        console.debug("Field set form values", values);

        const newLinkedFieldSet = {
          name: values.name,
          fields: Object.fromEntries(
            values.fields.map((f) => {
              const parts = f.selected.split(".").slice(1); // TODO: Condense this with filter (_, i)
              const entry = [parts[0], parts.slice(2)];
              console.debug("Linked field set entry", entry);
              return entry;
            }),
          ),
        };

        const onSuccess = () => {
          if (onSubmit) onSubmit();
        };

        if (mode === FORM_MODE_ADD) {
          await addLinkedFieldSet(newLinkedFieldSet, onSuccess);
        } else {
          await saveLinkedFieldSet(newLinkedFieldSet, onSuccess);
        }
      })
      .catch((err) => {
        console.error("Encountered error validating fields", err);
      });
  }, [form, onSubmit, mode, addLinkedFieldSet, saveLinkedFieldSet]);
  const handleCancel = useCallback(() => (onCancel ?? nop)(), [onCancel]);

  const modalTitle =
    mode === FORM_MODE_ADD
      ? `Add New Linked Field Set to Dataset "${dataset.title}"`
      : `Edit Linked Field Set "${linkedFieldSet?.name ?? ""}" on Dataset "${dataset.title}"`;

  return (
    <Modal
      title={modalTitle}
      open={open}
      confirmLoading={isSavingDataset}
      destroyOnClose={true}
      width={768}
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <LinkedFieldSetForm dataTypes={dataTypes} initialValue={linkedFieldSet} mode={mode} form={form} />
    </Modal>
  );
};
LinkedFieldSetModal.defaultProps = {
  mode: FORM_MODE_ADD,
};
LinkedFieldSetModal.propTypes = {
  mode: propTypesFormMode,
  open: PropTypes.bool,
  dataset: datasetPropTypesShape,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,

  // For editing
  linkedFieldSetIndex: PropTypes.number,
  linkedFieldSet: linkedFieldSetPropTypesShape,
};

export default LinkedFieldSetModal;
