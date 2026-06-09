import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, App, Button, Dropdown, Form, Modal, Space, Upload } from "antd";
import {
  DownloadOutlined,
  DownOutlined,
  EditOutlined,
  GlobalOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAuthorizationHeader } from "bento-auth-js";

import type { DatasetModel, DatasetModelBase as DatasetModelBaseType } from "@/types/dataset";
import { prepareInitialValues, validateWithZod } from "./DatasetForm/helpers";
import { saveDraft, loadDraft, clearDraft, deserializeFormValues } from "@/utils/datasetDraftUtils";
import { fetchTranslation } from "@/api/datasetTranslations";
import { saveProjectDataset, fetchProjectsWithDatasets } from "@/modules/metadata/actions";
import { useProjects } from "@/modules/metadata/hooks";
import DatasetForm from "./DatasetForm";
import DatasetTranslationModal from "./DatasetTranslationModal";
import { useAppDispatch, useAppSelector } from "@/store";

interface DatasetProvenanceModalProps {
  dataset: (DatasetModel & { translations?: string[] }) | undefined;
  open: boolean;
  onClose: () => void;
}

const DatasetProvenanceModal = ({ dataset, open, onClose }: DatasetProvenanceModalProps) => {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const metadataUrl = useAppSelector((state) => state.services.metadataService?.url ?? "");
  const authHeader = useAuthorizationHeader();
  const { isSavingDataset } = useProjects();

  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [draftBanner, setDraftBanner] = useState<{ savedAt: string } | null>(null);
  const [importErrors, setImportErrors] = useState<Array<{ path: string; message: string }>>([]);
  const [exportingFr, setExportingFr] = useState(false);
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftKey = `dataset-draft:edit:${dataset?.identifier}`;
  const hasFrTranslation = (dataset?.translations ?? []).includes("fr");

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setDraftBanner(null);
      setImportErrors([]);
    }
  }, [open]);

  const enterEdit = useCallback(() => {
    const draft = loadDraft(draftKey);
    setDraftBanner(draft ? { savedAt: draft.savedAt } : null);
    setImportErrors([]);
    setEditing(true);
  }, [draftKey]);

  const exitEdit = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
      saveDraft(draftKey, form.getFieldsValue(true));
    }
    setDraftBanner(null);
    setImportErrors([]);
    form.resetFields();
    setEditing(false);
  }, [draftKey, form]);

  const handleValuesChange = useCallback(
    (_: unknown, allValues: unknown) => {
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

  const handleDatasetSubmit = useCallback(
    (values: DatasetModelBaseType) => {
      if (!dataset) return;
      const onSuccess = async () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
          debounceTimer.current = null;
        }
        clearDraft(draftKey);
        form.resetFields();
        await dispatch(fetchProjectsWithDatasets());
        setEditing(false);
      };
      dispatch(saveProjectDataset({ ...dataset, ...values }, onSuccess));
    },
    [dataset, dispatch, draftKey, form],
  );

  const handleSubmit = useCallback(() => {
    form.submit();
  }, [form]);

  const handleClose = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    onClose();
  }, [onClose]);

  const handleJsonUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          const result = validateWithZod(parsed);

          const skippedFields = new Set(
            result.success ? [] : result.errors.map((err) => err.path.split(".")[0]).filter(Boolean),
          );

          const cleaned = Object.fromEntries(Object.entries(parsed).filter(([k]) => !skippedFields.has(k)));
          form.setFieldsValue(prepareInitialValues(cleaned));

          if (skippedFields.size === 0) {
            setImportErrors([]);
            message.success("JSON imported — review the fields before saving.");
          } else {
            const skippedErrors = !result.success
              ? result.errors.filter((err: { path: string }) => skippedFields.has(err.path.split(".")[0]))
              : [];
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

  const downloadJson = useCallback((data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExport = useCallback(
    async ({ key }: { key: string }) => {
      if (!dataset) return;
      if (key === "en") {
        downloadJson(dataset, `${dataset.identifier}-en.json`);
      } else if (key === "fr") {
        setExportingFr(true);
        const result = await fetchTranslation(metadataUrl, dataset.identifier, "fr", authHeader);
        setExportingFr(false);
        if (result.exists === true) {
          downloadJson(result.data, `${dataset.identifier}-fr.json`);
        } else if (result.exists === false) {
          message.warning("No French translation exists for this dataset.");
        } else {
          message.error(`Failed to fetch French translation: ${result.error}`);
        }
      }
    },
    [authHeader, dataset, downloadJson, message, metadataUrl],
  );

  const exportMenuItems = [
    { key: "en", label: "English (canonical)" },
    ...(hasFrTranslation ? [{ key: "fr", label: "French translation" }] : []),
  ];

  const viewFooter = (
    <Space style={{ width: "100%", justifyContent: "space-between" }}>
      <Space>
        <Dropdown menu={{ items: exportMenuItems, onClick: handleExport }} trigger={["click"]} disabled={exportingFr}>
          <Button icon={<DownloadOutlined />} loading={exportingFr}>
            Export <DownOutlined />
          </Button>
        </Dropdown>
        <Button icon={<GlobalOutlined />} onClick={() => setTranslationModalOpen(true)}>
          {hasFrTranslation ? "Edit French Translation" : "Add French Translation"}
        </Button>
      </Space>
      <Space>
        <Button icon={<EditOutlined />} type="primary" onClick={enterEdit}>
          Edit
        </Button>
        <Button onClick={handleClose}>Close</Button>
      </Space>
    </Space>
  );

  const editFooter = (
    <Space>
      <Upload key="import" accept=".json" showUploadList={false} beforeUpload={handleJsonUpload}>
        <Button icon={<UploadOutlined />}>Import JSON</Button>
      </Upload>
      <Button onClick={exitEdit}>Cancel</Button>
      <Button icon={<SaveOutlined />} type="primary" onClick={handleSubmit} loading={isSavingDataset}>
        Save
      </Button>
    </Space>
  );

  return (
    <>
      <Modal
        open={open}
        width={editing ? 848 : 960}
        title={editing ? `Edit Dataset "${dataset?.title ?? ""}"` : "Dataset Provenance"}
        footer={editing ? editFooter : viewFooter}
        onCancel={editing ? exitEdit : handleClose}
        destroyOnClose
      >
        {editing && draftBanner && (
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
        {dataset && (
          <DatasetForm
            form={form}
            initialValues={dataset}
            readOnly={!editing}
            onSubmit={handleDatasetSubmit}
            onValuesChange={editing ? handleValuesChange : undefined}
            open={open}
          />
        )}
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
      </Modal>
      {dataset && (
        <DatasetTranslationModal
          dataset={dataset}
          open={translationModalOpen}
          onSave={() => dispatch(fetchProjectsWithDatasets())}
          onClose={() => setTranslationModalOpen(false)}
        />
      )}
    </>
  );
};

export default DatasetProvenanceModal;
