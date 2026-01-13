import { useMemo } from "react";

import { Button, Form, type FormInstance, Upload } from "antd";
import type { RcFile } from "antd/es/upload";
import { UploadOutlined } from "@ant-design/icons";

import { getFalse } from "@/utils/misc";

import DropBoxTreeSelect from "./DropBoxTreeSelect";

type FileUploadFormProps = {
  initialUploadFolder?: string;
  initialUploadFiles?: File[];
  form: FormInstance;
};

// In Ant Design example code, they allow for the possibility of an array being passed here instead of an object with
// the fileList property. I'm not sure why, but we have kept that handling here just in case.
const getFileListFromEvent = (e: RcFile[] | { fileList: RcFile[] }) => (Array.isArray(e) ? e : e && e.fileList);

const FileUploadForm = ({ initialUploadFolder, initialUploadFiles, form }: FileUploadFormProps) => {
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

  const selectedParent = Form.useWatch("parent", form);

  return (
    <Form initialValues={initialValues} form={form} layout="vertical">
      <Form.Item
        label="Parent Folder"
        name="parent"
        rules={[{ required: true, message: "Please select a folder to upload into." }]}
      >
        <DropBoxTreeSelect
          folderMode={true}
          allowFolderCreation={true}
          setValue={(value) => {
            form.setFieldValue("parent", value);
          }}
        />
      </Form.Item>
      <Form.Item
        label="File"
        name="files"
        valuePropName="fileList"
        getValueFromEvent={getFileListFromEvent}
        rules={[{ required: true, message: "Please specify at least one file to upload." }]}
        extra={
          <span>
            Uploading to {selectedParent}
            {selectedParent === "/" ? "" : "/"}
          </span>
        }
      >
        <Upload beforeUpload={getFalse}>
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};

export default FileUploadForm;
