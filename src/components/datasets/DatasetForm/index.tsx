import { useCallback, useMemo, useState } from "react";
import { Alert, ConfigProvider, Form, Tabs, message } from "antd";
import type { FormInstance } from "antd";

import type { DatasetModel as DatasetModelType, DatasetModelBase as DatasetModelBaseType } from "@/types/dataset";
import { cleanFormValues, dayjsToDateString, formatErrorPath, prepareInitialValues, validateWithZod } from "./helpers";
import RequiredMark from "./RequiredMark";
import CoreInfoTab from "./tabs/CoreInfoTab";
import ContactsTab from "./tabs/ContactsTab";
import LinksMediaTab from "./tabs/LinksMediaTab";
import ClassificationTab from "./tabs/ClassificationTab";
import StudyDetailsTab from "./tabs/StudyDetailsTab";
import PublicationsFundingTab from "./tabs/PublicationsFundingTab";
import PcglInfoTab from "./tabs/PcglInfoTab";

export interface DatasetFormProps {
  onSubmit?: (data: DatasetModelBaseType) => void;
  initialValues?: Partial<DatasetModelType>;
  form: FormInstance;
  readOnly?: boolean;
  onValuesChange?: (changedValues: unknown, allValues: unknown) => void;
}

const DatasetForm = ({ onSubmit, initialValues, form, readOnly, onValuesChange }: DatasetFormProps) => {
  const [zodErrors, setZodErrors] = useState<Array<{ path: string; message: string }>>([]);
  const [fieldErrors, setFieldErrors] = useState<Array<{ path: string; message: string }>>([]);
  const [activeTab, setActiveTab] = useState("core");

  const preparedInitialValues = useMemo(
    () => ({
      schema_version: "1.0",
      language: "en",
      primary_contact: { type: "person" },
      stakeholders: [{ type: "person" }],
      ...prepareInitialValues(initialValues),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialValues?.identifier],
  );

  const handleFinish = useCallback(
    (rawValues: Record<string, unknown>) => {
      const values: Record<string, unknown> = { ...rawValues };
      values.schema_version = "1.0";

      if (values.release_date) values.release_date = dayjsToDateString(values.release_date);
      if (values.last_modified) values.last_modified = dayjsToDateString(values.last_modified);

      if (values.publications) {
        values.publications = (values.publications as Record<string, unknown>[]).map((pub) => ({
          ...pub,
          publication_date: pub.publication_date ? dayjsToDateString(pub.publication_date) : undefined,
          publication_type:
            pub.publication_type === "__other" && pub.publication_type_other
              ? { other: pub.publication_type_other }
              : pub.publication_type,
          publication_venue: pub.publication_venue
            ? {
                ...(pub.publication_venue as Record<string, unknown>),
                venue_type: (() => {
                  const v = pub.publication_venue as Record<string, unknown>;
                  return v.venue_type === "__other" && v.venue_type_other
                    ? { other: v.venue_type_other }
                    : v.venue_type;
                })(),
              }
            : undefined,
        }));
      }

      if (values.typed_links) {
        values.links = [
          ...((values.links as unknown[]) ?? []),
          ...(values.typed_links as Record<string, unknown>[]).map((tl) => ({
            ...tl,
            type: tl.type === "__other" && tl.type_other ? { other: tl.type_other } : tl.type,
          })),
        ];
        delete values.typed_links;
      }

      if (values.keywords) {
        values.keywords = (values.keywords as unknown[]).map((kw) =>
          typeof kw === "string"
            ? kw
            : (kw as Record<string, unknown>).id
              ? { id: (kw as Record<string, unknown>).id, label: (kw as Record<string, unknown>).label || undefined }
              : ((kw as Record<string, unknown>).value ?? kw),
        );
      }

      const cleaned = cleanFormValues(values);
      const result = validateWithZod(cleaned);

      if (result.success) {
        setZodErrors([]);
        setFieldErrors([]);
        message.success("Validation passed!");
        onSubmit?.(result.data);
      } else {
        setZodErrors(result.errors);
        message.error("Validation failed — see errors below the form.");
      }
    },
    [onSubmit],
  );

  const handleFinishFailed = useCallback(
    ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
      const errors = errorFields.flatMap(({ name, errors }) =>
        errors.map((message) => ({ path: name.join("."), message })),
      );
      setFieldErrors(errors);
    },
    [],
  );

  return (
    <div>
      <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 8 } } }}>
        <Form
          form={form}
          layout="vertical"
          size="small"
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
          onValuesChange={onValuesChange}
          initialValues={preparedInitialValues}
          scrollToFirstError
          disabled={readOnly}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 16 }}
            items={[
              {
                key: "core",
                forceRender: true,
                label: (
                  <span>
                    Core Info <RequiredMark />
                  </span>
                ),
                children: <CoreInfoTab />,
              },
              {
                key: "contacts",
                forceRender: true,
                label: (
                  <span>
                    Contacts <RequiredMark />
                  </span>
                ),
                children: <ContactsTab form={form} />,
              },
              {
                key: "links",
                forceRender: true,
                label: "Links & Media",
                children: <LinksMediaTab />,
              },
              {
                key: "classification",
                forceRender: true,
                label: "Classification",
                children: <ClassificationTab />,
              },
              {
                key: "study",
                forceRender: true,
                label: "Study Details",
                children: <StudyDetailsTab />,
              },
              {
                key: "publications",
                forceRender: true,
                label: "Publications & Funding",
                children: <PublicationsFundingTab form={form} />,
              },
              {
                key: "pcgl",
                forceRender: true,
                label: "PCGL Info",
                children: <PcglInfoTab />,
              },
            ]}
          />

          {fieldErrors.length > 0 && (
            <Alert
              type="error"
              showIcon
              closable
              onClose={() => setFieldErrors([])}
              style={{ marginBottom: 16 }}
              message="Required Fields Missing"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {fieldErrors.map((err, i) => (
                    <li key={i}>
                      <strong>{formatErrorPath(err.path)}</strong>: {err.message}
                    </li>
                  ))}
                </ul>
              }
            />
          )}

          {zodErrors.length > 0 && (
            <Alert
              type="error"
              showIcon
              closable
              onClose={() => setZodErrors([])}
              style={{ marginBottom: 16 }}
              message="Validation Errors"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {zodErrors.map((err, i) => (
                    <li key={i}>
                      <strong>{formatErrorPath(err.path)}</strong>: {err.message}
                    </li>
                  ))}
                </ul>
              }
            />
          )}
        </Form>
      </ConfigProvider>
    </div>
  );
};

export default DatasetForm;
