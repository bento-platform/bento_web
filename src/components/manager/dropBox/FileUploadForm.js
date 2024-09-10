import { useCallback, useMemo } from "react";
import PropTypes from "prop-types";

import { Button, Form, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { getFalse } from "@/utils/misc";

import DropBoxTreeSelect from "./DropBoxTreeSelect";

const FileUploadForm = ({ initialUploadFolder, initialUploadFiles, form }) => {
  const getFileListFromEvent = useCallback((e) => (Array.isArray(e) ? e : e && e.fileList), []);

  const initialValues = useMemo(
    () => ({
      ...(initialUploadFolder ? { parent: initialUploadFolder } : {}),
      ...(initialUploadFiles
        ? {
          files: initialUploadFiles.map((u, i) => ({
            // ...u doesn't work for File object
            lastModified: u.lastModified,
            name: u.name,
            size: u.size,
            type: u.type,

            uid: (-1 * (i + 1)).toString(),
            originFileObj: u,
          })),
        }
        : {}),
    }),
    [initialUploadFolder, initialUploadFiles],
  );

  return (
    <Form initialValues={initialValues} form={form} layout="vertical">
      <Form.Item
        label="Parent Folder"
        name="parent"
        rules={[{ required: true, message: "Please select a folder to upload into." }]}
      >
        <DropBoxTreeSelect folderMode={true} />
      </Form.Item>
      <Form.Item
        label="File"
        name="files"
        valuePropName="fileList"
        getValueFromEvent={getFileListFromEvent}
        rules={[{ required: true, message: "Please specify at least one file to upload." }]}
      >
        <Upload beforeUpload={getFalse}>
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};

FileUploadForm.propTypes = {
  initialUploadFolder: PropTypes.string,
  initialUploadFiles: PropTypes.arrayOf(PropTypes.object),
  form: PropTypes.object,
};

export default FileUploadForm;
