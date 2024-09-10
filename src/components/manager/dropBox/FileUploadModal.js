import { useCallback, useEffect } from "react";
import PropTypes from "prop-types";

import { Form, message, Modal } from "antd";

import {
  beginDropBoxPuttingObjects,
  endDropBoxPuttingObjects,
  invalidateDropBoxTree,
  putDropBoxObject,
} from "@/modules/dropBox/actions";
import { useDropBox } from "@/modules/dropBox/hooks";
import { useAppDispatch } from "@/store";

import FileUploadForm from "./FileUploadForm";

const FileUploadModal = ({ initialUploadFolder, initialUploadFiles, onCancel, open }) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const isPutting = useDropBox().isPuttingFlow;

  useEffect(() => {
    if (open) {
      // If we just re-opened the model, reset the fields
      form.resetFields();
    }
  }, [open, form]);

  const onOk = useCallback(() => {
    if (!form) {
      console.error("missing form");
      return;
    }

    form
      .validateFields()
      .then((values) => {
        (async () => {
          dispatch(beginDropBoxPuttingObjects());

          for (const file of values.files) {
            if (!file.name) {
              console.error("Cannot upload file with no name", file);
              continue;
            }

            const path = `${values.parent.replace(/\/$/, "")}/${file.name}`;

            try {
              await dispatch(putDropBoxObject(path, file.originFileObj));
            } catch (e) {
              console.error(e);
              message.error(`Error uploading file to drop box path: ${path}`);
            }
          }

          // Trigger a reload of the file tree with the newly-uploaded file(s)
          dispatch(invalidateDropBoxTree());

          // Finish the object-putting flow
          dispatch(endDropBoxPuttingObjects());

          // Close ourselves (the upload modal)
          if (onCancel) onCancel();
        })();
      })
      .catch((err) => {
        console.error(err);
      });
  }, [dispatch, form, onCancel]);

  return (
    <Modal title="Upload" okButtonProps={{ loading: isPutting }} onCancel={onCancel} open={open} onOk={onOk}>
      <FileUploadForm form={form} initialUploadFolder={initialUploadFolder} initialUploadFiles={initialUploadFiles} />
    </Modal>
  );
};

FileUploadModal.propTypes = {
  initialUploadFolder: PropTypes.string,
  initialUploadFiles: PropTypes.arrayOf(PropTypes.instanceOf(File)),
  onCancel: PropTypes.func,
  open: PropTypes.bool,
};

export default FileUploadModal;
