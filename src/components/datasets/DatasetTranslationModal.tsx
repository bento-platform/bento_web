import { useCallback, useState } from "react";
import { Alert, App, Button, Modal, Space, Upload } from "antd";
import { GlobalOutlined, InboxOutlined } from "@ant-design/icons";
import { useAuthorizationHeader } from "bento-auth-js";

import type { DRFErrors } from "@/api/datasetTranslations";
import { upsertTranslation } from "@/api/datasetTranslations";
import { validateWithZod } from "./DatasetForm/helpers";
import type { DatasetModelBase } from "@/types/dataset";
import { useAppSelector } from "@/store";

const LANG = "fr";
const LANG_LABEL = "French";

interface DatasetTranslationModalProps {
  dataset: Record<string, unknown> & { identifier: string; title?: string; translations?: string[] };
  open: boolean;
  onSave?: () => void;
  onClose: () => void;
}

const DRFErrorList = ({ errors }: { errors: DRFErrors }) => (
  <ul style={{ margin: 0, paddingLeft: 20 }}>
    {Object.entries(errors).map(([field, messages]) => (
      <li key={field}>
        <strong>{field === "non_field_errors" ? "General" : field.replace(/_/g, " ")}</strong>: {messages.join(" ")}
      </li>
    ))}
  </ul>
);

const DatasetTranslationModal = ({ dataset, open, onSave, onClose }: DatasetTranslationModalProps) => {
  const { message } = App.useApp();
  const metadataUrl = useAppSelector((state) => state.services.metadataService?.url ?? "");
  const authHeader = useAuthorizationHeader();

  const isEdit = (dataset.translations ?? []).includes(LANG);
  const [saving, setSaving] = useState(false);
  const [drfErrors, setDrfErrors] = useState<DRFErrors | null>(null);

  const handleUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(e.target?.result as string);
        } catch {
          message.error("Invalid JSON file.");
          return;
        }

        const validation = validateWithZod(parsed);
        if (!validation.success) {
          message.error(`JSON validation failed: ${validation.errors[0]?.message ?? "unknown error"}`);
          return;
        }

        setSaving(true);
        setDrfErrors(null);

        const result = await upsertTranslation(
          metadataUrl,
          dataset.identifier,
          LANG,
          validation.data as DatasetModelBase,
          isEdit,
          authHeader,
        );

        if (result.ok) {
          message.success(`${LANG_LABEL} translation ${isEdit ? "updated" : "added"} successfully.`);
          onSave?.();
          onClose();
        } else if (result.drfErrors) {
          setDrfErrors(result.drfErrors);
        } else {
          message.error(`Unexpected error (HTTP ${result.status}). Please try again.`);
        }

        setSaving(false);
      };
      reader.readAsText(file);
      return false;
    },
    [authHeader, dataset.identifier, dataset.translations, message, metadataUrl, onSave, onClose],
  );

  const handleCancel = useCallback(() => {
    setDrfErrors(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={open}
      width={560}
      destroyOnClose
      title={
        <Space>
          <GlobalOutlined />
          <span>
            {LANG_LABEL} Translation &ndash; &ldquo;{dataset?.title ?? ""}&rdquo;
          </span>
        </Space>
      }
      footer={<Button onClick={handleCancel}>Close</Button>}
      onCancel={handleCancel}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Alert
          type={isEdit ? "info" : "warning"}
          showIcon
          message={
            isEdit ? `Existing ${LANG_LABEL} translation will be replaced` : `No ${LANG_LABEL} translation yet`
          }
          description={`Upload a JSON file with the ${LANG_LABEL} dataset payload. The "language" field must be "${LANG}".`}
        />

        <Upload.Dragger
          accept=".json"
          showUploadList={false}
          beforeUpload={handleUpload}
          disabled={saving}
          style={{ padding: "8px 0" }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{saving ? "Uploading…" : "Click or drag a JSON file here"}</p>
        </Upload.Dragger>

        {drfErrors && (
          <Alert
            type="error"
            showIcon
            closable
            onClose={() => setDrfErrors(null)}
            message="The server rejected this translation"
            description={<DRFErrorList errors={drfErrors} />}
          />
        )}
      </Space>
    </Modal>
  );
};

export default DatasetTranslationModal;
