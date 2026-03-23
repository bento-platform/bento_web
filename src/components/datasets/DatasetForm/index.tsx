import React, { useCallback, useMemo, useState } from "react";
import { Alert, Button, Divider, Form, Space, Tabs, Typography, message } from "antd";
import type { FormInstance } from "antd";

import type { DatasetModel as DatasetModelType } from "@/types/dataset";
import { cleanFormValues, dayjsToDateString, prepareInitialValues, validateWithZod } from "./helpers";
import RequiredMark from "./RequiredMark";
import CoreInfoTab from "./tabs/CoreInfoTab";
import ContactsTab from "./tabs/ContactsTab";
import LinksMediaTab from "./tabs/LinksMediaTab";
import ClassificationTab from "./tabs/ClassificationTab";
import StudyDetailsTab from "./tabs/StudyDetailsTab";
import PublicationsFundingTab from "./tabs/PublicationsFundingTab";
import PcglInfoTab from "./tabs/PcglInfoTab";

const { Title, Text } = Typography;

export interface DatasetFormProps {
  /** Called with the Zod-validated DatasetModelType on successful submit */
  onSubmit?: (data: DatasetModelType) => void;
  /** Optional initial values for editing an existing dataset */
  initialValues?: Partial<DatasetModelType>;
  /**
   * External form instance. When provided the component renders without its
   * own title, description, or submit/reset buttons — the parent (e.g. a
   * Modal) owns those concerns and can call form.submit() to trigger
   * validation and the onSubmit callback.
   */
  form?: FormInstance;
}

const DatasetForm: React.FC<DatasetFormProps> = ({ onSubmit, initialValues, form: externalForm }) => {
  const [internalForm] = Form.useForm();
  const form = externalForm ?? internalForm;
  const isEmbedded = !!externalForm;
  const [zodErrors, setZodErrors] = useState<Array<{ path: string; message: string }>>([]);
  const preparedInitialValues = useMemo(
    () => ({ schema_version: "1.0", ...prepareInitialValues(initialValues) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialValues?.identifier],
  );

  const handleFinish = useCallback(
    (rawValues: any) => {
      const values = { ...rawValues };
      values.schema_version = "1.0";

      if (values.release_date) values.release_date = dayjsToDateString(values.release_date);
      if (values.last_modified) values.last_modified = dayjsToDateString(values.last_modified);

      if (values.publications) {
        values.publications = values.publications.map((pub: any) => ({
          ...pub,
          publication_date: pub.publication_date ? dayjsToDateString(pub.publication_date) : undefined,
          publication_type:
            pub.publication_type === "__other" && pub.publication_type_other
              ? { other: pub.publication_type_other }
              : pub.publication_type,
          publication_venue: pub.publication_venue
            ? {
                ...pub.publication_venue,
                venue_type:
                  pub.publication_venue.venue_type === "__other" && pub.publication_venue.venue_type_other
                    ? { other: pub.publication_venue.venue_type_other }
                    : pub.publication_venue.venue_type,
              }
            : undefined,
        }));
      }

      if (values.typed_links) {
        values.links = [
          ...(values.links ?? []),
          ...values.typed_links.map((tl: any) => ({
            ...tl,
            type: tl.type === "__other" && tl.type_other ? { other: tl.type_other } : tl.type,
          })),
        ];
        delete values.typed_links;
      }

      if (values.keywords) {
        values.keywords = values.keywords.map((kw: any) =>
          typeof kw === "string" ? kw : kw.id ? { id: kw.id, label: kw.label || undefined } : kw.value ?? kw
        );
      }

      const cleaned = cleanFormValues(values);
      const result = validateWithZod(cleaned);

      if (result.success) {
        setZodErrors([]);
        message.success("Validation passed!");
        onSubmit?.(result.data);
      } else {
        setZodErrors(result.errors);
        message.error("Validation failed — see errors below the form.");
      }
    },
    [onSubmit],
  );

  return (
    <div style={isEmbedded ? {} : { maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {!isEmbedded && (
        <>
          <Title level={3}>Dataset Metadata Form</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
            Fill in the dataset metadata below. Required fields are marked with *.
          </Text>
        </>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={preparedInitialValues}
        scrollToFirstError
      >
        <Tabs
          style={{ marginBottom: 16 }}
          items={[
            {
              key: "core",
              label: <span>Core Info <RequiredMark /></span>,
              children: <CoreInfoTab />,
            },
            {
              key: "contacts",
              label: <span>Contacts <RequiredMark /></span>,
              children: <ContactsTab form={form} />,
            },
            {
              key: "links",
              label: "Links & Media",
              children: <LinksMediaTab />,
            },
            {
              key: "classification",
              label: "Classification",
              children: <ClassificationTab />,
            },
            {
              key: "study",
              label: "Study Details",
              children: <StudyDetailsTab />,
            },
            {
              key: "publications",
              label: "Publications & Funding",
              children: <PublicationsFundingTab form={form} />,
            },
            {
              key: "pcgl",
              label: "PCGL Info",
              children: <PcglInfoTab />,
            },
          ]}
        />

        {zodErrors.length > 0 && (
          <Alert
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            message="Zod Validation Errors"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {zodErrors.map((err, i) => (
                  <li key={i}>
                    <strong>{err.path || "(root)"}</strong>: {err.message}
                  </li>
                ))}
              </ul>
            }
          />
        )}

        {!isEmbedded && (
          <>
            <Divider />
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" size="large">
                  Validate &amp; Submit
                </Button>
                <Button
                  htmlType="button"
                  onClick={() => {
                    form.resetFields();
                    setZodErrors([]);
                  }}
                >
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </>
        )}
      </Form>
    </div>
  );
};

export default DatasetForm;
