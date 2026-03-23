import type { FC } from "react";
import { Form, Modal } from "antd";

import type { DatasetModel } from "@/types/dataset";
import DatasetForm from "./DatasetForm";

interface DatasetProvenanceModalProps {
  dataset: DatasetModel | undefined;
  open: boolean;
  onClose: () => void;
}

const DatasetProvenanceModal: FC<DatasetProvenanceModalProps> = ({ dataset, open, onClose }) => {
  const [form] = Form.useForm();

  return (
    <Modal title="Dataset Provenance" open={open} onCancel={onClose} footer={null} width={960} destroyOnClose>
      {dataset && <DatasetForm form={form} initialValues={dataset} readOnly />}
    </Modal>
  );
};

export default DatasetProvenanceModal;
