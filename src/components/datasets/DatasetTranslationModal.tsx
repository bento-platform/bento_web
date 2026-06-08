import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Form, Modal, Space, Spin, Typography, Upload } from "antd";
import { GlobalOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";

import DatasetForm from "./DatasetForm";
import { prepareInitialValues, validateWithZod } from "./DatasetForm/helpers";
import type { DRFErrors } from "@/api/datasetTranslations";
import { fetchTranslation, upsertTranslation } from "@/api/datasetTranslations";
import type { DatasetModelBase } from "@/types/dataset";
import { useAppSelector } from "@/store";

const LANG = "fr";
const LANG_LABEL = "French";

interface DatasetTranslationModalProps {
  dataset: Record<string, unknown> & { identifier: string; title?: string };
  open: boolean;
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

const DatasetTranslationModal = ({ dataset, open, onClose }: DatasetTranslationModalProps) => {
  const { message } = App.useApp();
  const metadataUrl = useAppSelector((state) => state.services.metadataService?.url ?? "");

  const [form] = Form.useForm();
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<DatasetModelBase> | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [drfErrors, setDrfErrors] = useState<DRFErrors | null>(null);
  const [importErrors, setImportErrors] = useState<Array<{ path: string; message: string }>>([]);

  useEffect(() => {
    if (!open || !metadataUrl || !dataset?.identifier) return;

    setChecking(true);
    setFetchError(null);
    setDrfErrors(null);

    fetchTranslation(metadataUrl, dataset.identifier, LANG).then((result) => {
      if (result.exists === true) {
        setIsEdit(true);
        setInitialValues({ ...result.data, language: LANG });
      } else if (result.exists === false) {
        setIsEdit(false);
        // Pre-fill with canonical dataset data so the user has a starting point
        setInitialValues({ ...(dataset as Partial<DatasetModelBase>), language: LANG });
      } else {
        setFetchError(result.error);
      }
      setChecking(false);
    });
  }, [open, metadataUrl, dataset]);

  const handleSubmit = useCallback(
    async (validatedData: DatasetModelBase) => {
      setSaving(true);
      setDrfErrors(null);

      const result = await upsertTranslation(metadataUrl, dataset.identifier, LANG, validatedData, isEdit);

      if (result.ok) {
        message.success(`${LANG_LABEL} translation ${isEdit ? "updated" : "added"} successfully.`);
        form.resetFields();
        onClose();
      } else if (result.drfErrors) {
        setDrfErrors(result.drfErrors);
      } else {
        message.error(`Unexpected error (HTTP ${result.status}). Please try again.`);
      }

      setSaving(false);
    },
    [metadataUrl, dataset.identifier, isEdit, form, onClose, message],
  );

  const handleJsonUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          const result = validateWithZod(parsed);

          const allErrors = result.success ? [] : result.errors;
          const skippedFields = new Set(allErrors.map((err) => err.path.split(".")[0]).filter(Boolean));

          const cleaned = Object.fromEntries(Object.entries(parsed).filter(([k]) => !skippedFields.has(k)));
          form.setFieldsValue(prepareInitialValues(cleaned));

          if (skippedFields.size === 0) {
            setImportErrors([]);
            message.success("JSON imported — review the fields before saving.");
          } else {
            const skippedErrors = allErrors.filter((err) => skippedFields.has(err.path.split(".")[0]));
            setImportErrors(skippedErrors);
            message.warning(`JSON imported — ${skippedFields.size} field(s) skipped due to invalid values.`);
          }
        } catch {
          message.error("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
      return false;
    },
    [form, message],
  );

  const handleCancel = useCallback(() => {
    form.resetFields();
    setDrfErrors(null);
    setFetchError(null);
    setImportErrors([]);
    setInitialValues(undefined);
    onClose();
  }, [form, onClose]);

  return (
    <Modal
      open={open}
      width={848}
      destroyOnClose
      title={
        <Space>
          <GlobalOutlined />
          <span>
            {LANG_LABEL} Translation &ndash; &ldquo;{dataset?.title ?? ""}&rdquo;
          </span>
        </Space>
      }
      footer={
        checking || fetchError ? null : (
          <Space>
            <Upload accept=".json" showUploadList={false} beforeUpload={handleJsonUpload}>
              <Button icon={<UploadOutlined />}>Import JSON</Button>
            </Upload>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => form.submit()}>
              {isEdit ? "Update" : "Add"} Translation
            </Button>
          </Space>
        )
      }
      onCancel={handleCancel}
    >
      {checking ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Spin size="large" />
          <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
            Checking for existing {LANG_LABEL} translation&hellip;
          </Typography.Paragraph>
        </div>
      ) : fetchError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load translation data"
          description={fetchError}
          action={
            <Button size="small" onClick={handleCancel}>
              Close
            </Button>
          }
        />
      ) : (
        <>
          <Alert
            type={isEdit ? "info" : "warning"}
            showIcon
            style={{ marginBottom: 16 }}
            message={
              isEdit
                ? `Editing existing ${LANG_LABEL} (${LANG}) translation`
                : `Creating a new ${LANG_LABEL} (${LANG}) translation`
            }
            description={
              isEdit
                ? "The form is pre-filled with the current translation. Edit the fields you want to update."
                : `The form is pre-filled with the canonical dataset. Translate text fields into ${LANG_LABEL}. The Language field is fixed to "${LANG}".`
            }
          />

          {drfErrors && (
            <Alert
              type="error"
              showIcon
              closable
              onClose={() => setDrfErrors(null)}
              style={{ marginBottom: 16 }}
              message="The server rejected this translation"
              description={<DRFErrorList errors={drfErrors} />}
            />
          )}

          <DatasetForm form={form} onSubmit={handleSubmit} initialValues={initialValues} open={open} />

          {importErrors.length > 0 && (
            <Alert
              type="warning"
              showIcon
              closable
              onClose={() => setImportErrors([])}
              style={{ marginTop: 16 }}
              message="The following fields had invalid values and were not imported"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {importErrors.map((err, i) => (
                    <li key={i}>
                      <strong>{err.path || "root"}</strong>: {err.message}
                    </li>
                  ))}
                </ul>
              }
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default DatasetTranslationModal;
