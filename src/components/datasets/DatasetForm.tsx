// import PropTypes from "prop-types";

// import { Form, Input } from "antd";
// import { useEffect, useMemo } from "react";

// const { Item } = Form;

// import DataUseInput from "../DataUseInput";

// import { DATA_USE_PROP_TYPE_SHAPE, INITIAL_DATA_USE_VALUE } from "@/duo";
// import { useDatsValidator } from "@/hooks";
// import { useDiscoveryValidator } from "@/modules/metadata/hooks";
// import { simpleDeepCopy } from "@/utils/misc";
// import DropBoxJsonSelect from "../manager/dropBox/DropBoxJsonSelect";

// const DatasetForm = ({ initialValue, form }) => {
//   const discoveryValidator = useDiscoveryValidator();
//   const datsValidator = useDatsValidator();

//   // If the initial value changes (and is truthy), i.e., the dataset being edited has changed, then reset the form.
//   // This lets it be re-populated from the initialFormData object below.
//   useEffect(() => {
//     if (initialValue) {
//       form.resetFields();
//     }
//   }, [form, initialValue]);

//   const initialFormData = useMemo(
//     () => ({
//       ...(initialValue ?? {}),
//       // TODO: the input should populate its own initial value
//       data_use: initialValue?.data_use ?? simpleDeepCopy(INITIAL_DATA_USE_VALUE),
//     }),
//     [initialValue],
//   );

//   return (
//     <Form form={form} layout="vertical" initialValues={initialFormData}>
//       <Item label="Title" name="title" rules={[{ required: true }, { min: 3 }]}>
//         <Input placeholder="My Dataset" size="large" />
//       </Item>
//       <Item label="Description" name="description" rules={[{ required: true }]}>
//         <Input.TextArea placeholder="This is a dataset" />
//       </Item>
//       <Item label="Contact Information" name="contact_info">
//         <Input.TextArea placeholder={"Name\nInfo@c3g.ca"} />
//       </Item>
//       <Item label="DATS File" name="dats_file" rules={[{ required: true }, { validator: datsValidator }]}>
//         <DropBoxJsonSelect initialValue={initialFormData?.dats_file} />
//       </Item>
//       <Item label="Discovery Configuration" name="discovery" rules={[{ validator: discoveryValidator }]}>
//         <DropBoxJsonSelect initialValue={initialFormData?.discovery} nullable={true} />
//       </Item>
//       <Item
//         label="Consent Code and Data Use Requirements"
//         name="data_use"
//         rules={[
//           { required: true },
//           (rule, value, callback) => {
//             if (!(value.consent_code || {}).primary_category) {
//               callback(["Please specify one primary consent code"]);
//               return;
//             }
//             callback([]);
//           },
//         ]}
//       >
//         <DataUseInput />
//       </Item>
//     </Form>
//   );
// };

// DatasetForm.propTypes = {
//   initialValue: PropTypes.shape({
//     title: PropTypes.string,
//     description: PropTypes.string,
//     contact_info: PropTypes.string,
//     data_use: DATA_USE_PROP_TYPE_SHAPE, // TODO: Shared shape for data use
//     dats_file: PropTypes.object,
//     discovery: PropTypes.object,
//   }),
//   form: PropTypes.object,
// };

// export default DatasetForm;



/**
 * DatasetForm.tsx
 *
 * Ant Design form for the DatasetModel Zod schema.
 * Uses Zod for validation (run on submit), antd for UI with collapsible sections.
 *
 * Dependencies:
 *   antd ^5, @ant-design/icons, zod, react
 *
 * Usage:
 *   <DatasetForm onSubmit={(values) => console.log(values)} />
 */

import React, { useCallback, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Collapse,
  InputNumber,
  Switch,
  Space,
  Card,
  Divider,
  Radio,
  Typography,
  Alert,
  DatePicker,
  message,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UserOutlined,
  BankOutlined,
} from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs from "dayjs";

import {
  DatasetModel,
  RoleValues,
  PublicationTypeValues,
  PublicationVenueTypeValues,
  ParticipantCriterionTypeValues,
  LinkTypeValues,
} from "@/types/dataset";

import type {
  DatasetModel as DatasetModelType,
  PersonOrOrganization,
  Contact as ContactType,
  Phone as PhoneType,
} from "@/types/dataset";

const { TextArea } = Input;
const { Panel } = Collapse;
const { Title, Text } = Typography;
const { Option } = Select;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert antd form values → schema-compatible shape, then validate with Zod */
function validateWithZod(values: unknown): {
  success: true;
  data: DatasetModelType;
} | {
  success: false;
  errors: Array<{ path: string; message: string }>;
} {
  const result = DatasetModel.safeParse(values);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

/** Strip undefined / null leaves so Zod doesn't complain about missing optionals */
function cleanFormValues(obj: any): any {
  if (obj === null || obj === undefined || obj === "") return undefined;
  if (Array.isArray(obj)) {
    const cleaned = obj.map(cleanFormValues).filter((v) => v !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    let hasKeys = false;
    for (const [k, v] of Object.entries(obj)) {
      const cv = cleanFormValues(v);
      if (cv !== undefined) {
        cleaned[k] = cv;
        hasKeys = true;
      }
    }
    return hasKeys ? cleaned : undefined;
  }
  return obj;
}

/** Convert a dayjs date-picker value to YYYY-MM-DD string */
function dayjsToDateString(d: any): string | undefined {
  if (!d) return undefined;
  return dayjs(d).format("YYYY-MM-DD");
}

// ---------------------------------------------------------------------------
// Reusable sub-form fragments
// ---------------------------------------------------------------------------

const roleOptions = RoleValues.map((r) => ({ label: r, value: r }));
const publicationTypeOptions = PublicationTypeValues.map((t) => ({ label: t, value: t }));
const venueTypeOptions = PublicationVenueTypeValues.map((t) => ({ label: t, value: t }));
const criterionTypeOptions = ParticipantCriterionTypeValues.map((t) => ({ label: t, value: t }));
const linkTypeOptions = LinkTypeValues.map((t) => ({ label: t, value: t }));

/** Phone sub-fields */
const PhoneFields: React.FC<{ namePrefix: (string | number)[] }> = ({ namePrefix }) => (
  <Card size="small" title="Phone" style={{ marginBottom: 8 }}>
    <Form.Item label="Country code" name={[...namePrefix, "country_code"]} rules={[{ required: true }]}>
      <InputNumber style={{ width: "100%" }} placeholder="e.g. 1" />
    </Form.Item>
    <Form.Item label="Number" name={[...namePrefix, "number"]} rules={[{ required: true }]}>
      <InputNumber style={{ width: "100%" }} placeholder="e.g. 5551234567" />
    </Form.Item>
    <Form.Item label="Extension" name={[...namePrefix, "extension"]}>
      <InputNumber style={{ width: "100%" }} placeholder="Optional" />
    </Form.Item>
  </Card>
);

/** Contact sub-fields */
const ContactFields: React.FC<{ namePrefix: (string | number)[] }> = ({ namePrefix }) => (
  <Card size="small" title="Contact" style={{ marginBottom: 8 }}>
    <Form.Item label="Website" name={[...namePrefix, "website"]}>
      <Input placeholder="https://..." />
    </Form.Item>
    <Form.List name={[...namePrefix, "email"]}>
      {(fields, { add, remove }) => (
        <>
          <Text strong>Emails</Text>
          {fields.map(({ key, name, ...rest }) => (
            <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 4 }}>
              <Form.Item {...rest} name={name} rules={[{ type: "email", message: "Invalid email" }]}>
                <Input placeholder="email@example.com" style={{ width: 300 }} />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
            Add email
          </Button>
        </>
      )}
    </Form.List>
    <Form.Item label="Address" name={[...namePrefix, "address"]} style={{ marginTop: 12 }}>
      <TextArea rows={2} placeholder="Physical address" />
    </Form.Item>
    <PhoneFields namePrefix={[...namePrefix, "phone"]} />
  </Card>
);

/** Person sub-fields */
const PersonFields: React.FC<{ namePrefix: (string | number)[] }> = ({ namePrefix }) => (
  <>
    <Form.Item name={[...namePrefix, "type"]} initialValue="person" hidden>
      <Input />
    </Form.Item>
    <Form.Item label="Name" name={[...namePrefix, "name"]} rules={[{ required: true, min: 1 }]}>
      <Input placeholder="Full name" />
    </Form.Item>
    <Form.Item label="Honorific" name={[...namePrefix, "honorific"]}>
      <Input placeholder="e.g. Dr., Prof." />
    </Form.Item>
    <Form.Item label="Location" name={[...namePrefix, "location"]}>
      <Input placeholder="City, Country" />
    </Form.Item>
    <Form.Item label="Roles" name={[...namePrefix, "roles"]} rules={[{ required: true }]}>
      <Select mode="multiple" placeholder="Select roles" options={roleOptions} />
    </Form.Item>
    <Form.List name={[...namePrefix, "other_names"]}>
      {(fields, { add, remove }) => (
        <div style={{ marginBottom: 12 }}>
          <Text strong>Other names</Text>
          {fields.map(({ key, name, ...rest }) => (
            <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 4 }}>
              <Form.Item {...rest} name={name}>
                <Input placeholder="Alternative name" style={{ width: 300 }} />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
            Add name
          </Button>
        </div>
      )}
    </Form.List>
    <Collapse ghost>
      <Panel header="Contact info" key="contact">
        <ContactFields namePrefix={[...namePrefix, "contact"]} />
      </Panel>
    </Collapse>
  </>
);

/** Organization sub-fields */
const OrganizationFields: React.FC<{ namePrefix: (string | number)[] }> = ({ namePrefix }) => (
  <>
    <Form.Item name={[...namePrefix, "type"]} initialValue="organization" hidden>
      <Input />
    </Form.Item>
    <Form.Item label="Name" name={[...namePrefix, "name"]} rules={[{ required: true, min: 1 }]}>
      <Input placeholder="Organization name" />
    </Form.Item>
    <Form.Item label="Description" name={[...namePrefix, "description"]}>
      <TextArea rows={2} />
    </Form.Item>
    <Form.Item label="Location" name={[...namePrefix, "location"]}>
      <Input placeholder="City, Country" />
    </Form.Item>
    <Form.Item label="Roles" name={[...namePrefix, "roles"]} rules={[{ required: true }]}>
      <Select mode="multiple" placeholder="Select roles" options={roleOptions} />
    </Form.Item>
    <Collapse ghost>
      <Panel header="Contact info" key="contact">
        <ContactFields namePrefix={[...namePrefix, "contact"]} />
      </Panel>
    </Collapse>
  </>
);

/**
 * PersonOrOrganization — a switchable card that lets the user pick
 * whether this entry is a Person or an Organization.
 */
const PersonOrOrganizationFields: React.FC<{
  namePrefix: (string | number)[];
  form: FormInstance;
}> = ({ namePrefix, form }) => {
  const typeValue = Form.useWatch([...namePrefix, "type"], form) ?? "person";

  return (
    <Card size="small" style={{ marginBottom: 8 }}>
      <Form.Item label="Type" name={[...namePrefix, "type"]} initialValue="person">
        <Radio.Group
          onChange={(e) => {
            // Reset the sub-fields when toggling type
            const current = form.getFieldValue(namePrefix as string[]);
            const roles = current?.roles;
            const name = current?.name;
            form.setFieldValue(namePrefix as string[], {
              type: e.target.value,
              name,
              roles,
            });
          }}
        >
          <Radio.Button value="person">
            <UserOutlined /> Person
          </Radio.Button>
          <Radio.Button value="organization">
            <BankOutlined /> Organization
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      {typeValue === "person" ? (
        <PersonFields namePrefix={namePrefix} />
      ) : (
        <OrganizationFields namePrefix={namePrefix} />
      )}
    </Card>
  );
};

/** Publication Venue sub-fields */
const PublicationVenueFields: React.FC<{ namePrefix: (string | number)[] }> = ({ namePrefix }) => (
  <Card size="small" title="Venue" style={{ marginBottom: 8 }}>
    <Form.Item label="Venue name" name={[...namePrefix, "name"]} rules={[{ required: true, min: 1 }]}>
      <Input />
    </Form.Item>
    <Form.Item label="Venue type" name={[...namePrefix, "venue_type"]} rules={[{ required: true }]}>
      <Select placeholder="Select venue type" allowClear>
        {venueTypeOptions.map((o) => (
          <Option key={o.value} value={o.value}>
            {o.label}
          </Option>
        ))}
        <Option value="__other">Other (specify below)</Option>
      </Select>
    </Form.Item>
    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => {
        const prevVal = getNestedValue(prev, [...namePrefix, "venue_type"]);
        const curVal = getNestedValue(cur, [...namePrefix, "venue_type"]);
        return prevVal !== curVal;
      }}
    >
      {({ getFieldValue }) => {
        const val = getFieldValue([...namePrefix, "venue_type"]);
        return val === "__other" ? (
          <Form.Item label="Other venue type" name={[...namePrefix, "venue_type_other"]}>
            <Input placeholder="Specify venue type" />
          </Form.Item>
        ) : null;
      }}
    </Form.Item>
    <Form.Item label="URL" name={[...namePrefix, "url"]}>
      <Input placeholder="https://..." />
    </Form.Item>
    <Form.Item label="Publisher" name={[...namePrefix, "publisher"]}>
      <Input />
    </Form.Item>
    <Form.Item label="Location" name={[...namePrefix, "location"]}>
      <Input />
    </Form.Item>
  </Card>
);

/** Helper to access a nested value from a plain object by path array */
function getNestedValue(obj: any, path: (string | number)[]): any {
  let current = obj;
  for (const key of path) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

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

  /**
   * Transform raw antd form values into the shape Zod expects, then validate.
   */
  const handleFinish = useCallback(
    (rawValues: any) => {
      // Transform dates from dayjs → strings
      const values = { ...rawValues };
      values.schema_version = "1.0";

      if (values.release_date) values.release_date = dayjsToDateString(values.release_date);
      if (values.last_modified) values.last_modified = dayjsToDateString(values.last_modified);

      // Transform publication dates
      if (values.publications) {
        values.publications = values.publications.map((pub: any) => ({
          ...pub,
          publication_date: pub.publication_date
            ? dayjsToDateString(pub.publication_date)
            : undefined,
          // Handle "other" publication type
          publication_type:
            pub.publication_type === "__other" && pub.publication_type_other
              ? { other: pub.publication_type_other }
              : pub.publication_type,
          // Handle venue type "other"
          publication_venue: pub.publication_venue
            ? {
                ...pub.publication_venue,
                venue_type:
                  pub.publication_venue.venue_type === "__other" &&
                  pub.publication_venue.venue_type_other
                    ? { other: pub.publication_venue.venue_type_other }
                    : pub.publication_venue.venue_type,
              }
            : undefined,
        }));
      }

      // Handle typed links "other" type
      if (values.typed_links) {
        values.links = [
          ...(values.links ?? []),
          ...values.typed_links.map((tl: any) => ({
            ...tl,
            type:
              tl.type === "__other" && tl.type_other ? { other: tl.type_other } : tl.type,
          })),
        ];
        delete values.typed_links;
      }

      // Handle keywords that are ontology classes vs strings
      if (values.keywords) {
        values.keywords = values.keywords.map((kw: any) =>
          typeof kw === "string"
            ? kw
            : kw.id
            ? { id: kw.id, label: kw.label || undefined }
            : kw.value ?? kw
        );
      }

      // Clean up empty optional fields
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
    [onSubmit]
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
        initialValues={{
          schema_version: "1.0",
          ...initialValues,
        }}
        scrollToFirstError
      >
        <Tabs
          style={{ marginBottom: 16 }}
          items={[
            {
              key: "core",
              label: <span>Core Info <span style={{ color: "red" }}>*</span></span>,
              children: (
                <>
                  <Card title="Core Information" style={{ marginBottom: 16 }}>
                    <Form.Item
                      label="Title"
                      name="title"
                      rules={[{ required: true, min: 1, message: "Title is required" }]}
                    >
                      <Input placeholder="Dataset title" />
                    </Form.Item>

                    <Form.Item
                      label="Description"
                      name="description"
                      rules={[{ required: true, min: 1, message: "Description is required" }]}
                    >
                      <TextArea rows={3} placeholder="Brief description of the dataset" />
                    </Form.Item>

                    <Form.Item label="Version" name="version">
                      <Input placeholder="e.g. 1.0.0" />
                    </Form.Item>

                    <Form.Item label="Privacy" name="privacy">
                      <Input placeholder="e.g. public, restricted" />
                    </Form.Item>

                    <Form.Item label="Study status" name="study_status">
                      <Select placeholder="Select status" allowClear>
                        <Option value="ONGOING">Ongoing</Option>
                        <Option value="COMPLETED">Completed</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Study context" name="study_context">
                      <Select placeholder="Select context" allowClear>
                        <Option value="CLINICAL">Clinical</Option>
                        <Option value="RESEARCH">Research</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Release date" name="release_date">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="Last modified" name="last_modified">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Card>

                  <Card title="Long Description" style={{ marginBottom: 16 }}>
                    <Form.Item label="Content" name={["long_description", "content"]}>
                      <TextArea rows={6} placeholder="Extended description..." />
                    </Form.Item>
                    <Form.Item label="Content type" name={["long_description", "content_type"]}>
                      <Select placeholder="Select content type">
                        <Option value="text/plain">Plain text</Option>
                        <Option value="text/markdown">Markdown</Option>
                        <Option value="text/html">HTML</Option>
                      </Select>
                    </Form.Item>
                  </Card>

                  <Card title="PCGL Fields">
                    <Form.Item
                      label="PCGL Program Name"
                      name="pcgl_program_name"
                      tooltip="The overarching program the study belongs to"
                    >
                      <Input />
                    </Form.Item>
                    <Form.List name="pcgl_domain">
                      {(fields, { add, remove }) => (
                        <>
                          <Text strong>PCGL Domains</Text>
                          {fields.map(({ key, name, ...rest }) => (
                            <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 4 }}>
                              <Form.Item {...rest} name={name}>
                                <Input placeholder="Domain" style={{ width: 400 }} />
                              </Form.Item>
                              <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                            Add domain
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                </>
              ),
            },
            {
              key: "contacts",
              label: <span>Contacts <span style={{ color: "red" }}>*</span></span>,
              children: (
                <>
                  <Card title="Primary Contact *" style={{ marginBottom: 16 }}>
                    <PersonOrOrganizationFields namePrefix={["primary_contact"]} form={form} />
                  </Card>

                  <Card title="Stakeholders *">
                    <Form.List name="stakeholders" initialValue={[{ type: "person" }]}>
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <div key={key} style={{ position: "relative" }}>
                              <PersonOrOrganizationFields namePrefix={["stakeholders", name]} form={form} />
                              {fields.length > 1 && (
                                <Button
                                  danger
                                  size="small"
                                  onClick={() => remove(name)}
                                  style={{ position: "absolute", top: 8, right: 8 }}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button type="dashed" onClick={() => add({ type: "person" })} icon={<PlusOutlined />}>
                            Add stakeholder
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                </>
              ),
            },
            {
              key: "links",
              label: "Links & Media",
              children: (
                <>
                  <Card title="Links" style={{ marginBottom: 16 }}>
                    <Form.List name="links">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item
                                label="Label"
                                name={[name, "label"]}
                              >
                                <Input placeholder="Link label" />
                              </Form.Item>
                              <Form.Item
                                label="URL"
                                name={[name, "url"]}
                                rules={[{ type: "url" }]}
                              >
                                <Input placeholder="https://..." />
                              </Form.Item>
                              <Button danger size="small" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add link
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>

                  <Card title="Logos">
                    <Form.List name="logos">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item
                                label="URL"
                                name={[name, "url"]}
                                rules={[{ required: true, type: "url" }]}
                              >
                                <Input placeholder="https://..." />
                              </Form.Item>
                              <Form.Item label="Theme" name={[name, "theme"]} initialValue="default">
                                <Select>
                                  <Option value="default">Default</Option>
                                  <Option value="light">Light</Option>
                                  <Option value="dark">Dark</Option>
                                </Select>
                              </Form.Item>
                              <Form.Item label="Description" name={[name, "description"]}>
                                <Input />
                              </Form.Item>
                              <Form.Item
                                label="Contains text"
                                name={[name, "contains_text"]}
                                valuePropName="checked"
                                initialValue={false}
                              >
                                <Switch />
                              </Form.Item>
                              <Button danger size="small" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add logo
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                </>
              ),
            },
            {
              key: "classification",
              label: "Classification",
              children: (
                <>
                  <Card title="Keywords" style={{ marginBottom: 16 }}>
                    <Form.List name="keywords">
                      {(fields, { add, remove }) => (
                        <>
                          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                            Each keyword can be a plain string or an OntologyClass (id + optional label).
                          </Text>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item label="Keyword (string)" name={[name, "value"]}>
                                <Input placeholder="Plain keyword text" />
                              </Form.Item>
                              <Text type="secondary">— or as OntologyClass —</Text>
                              <Form.Item label="Ontology ID" name={[name, "id"]} style={{ marginTop: 8 }}>
                                <Input placeholder="e.g. HP:0001234" />
                              </Form.Item>
                              <Form.Item label="Label" name={[name, "label"]}>
                                <Input placeholder="Human-readable label" />
                              </Form.Item>
                              <Button danger size="small" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add keyword
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>

                  <Card title="Taxonomy" style={{ marginBottom: 16 }}>
                    <Form.List name="taxonomy">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item label="String value" name={[name, "value"]}>
                                <Input placeholder="Plain text taxonomy entry" />
                              </Form.Item>
                              <Text type="secondary">— or as OntologyClass —</Text>
                              <Form.Item label="Ontology ID" name={[name, "id"]} style={{ marginTop: 8 }}>
                                <Input placeholder="e.g. NCIT:C12345" />
                              </Form.Item>
                              <Form.Item label="Label" name={[name, "label"]}>
                                <Input placeholder="Human-readable label" />
                              </Form.Item>
                              <Button danger size="small" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add taxonomy entry
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>

                  <Card title="Ontology Resources" style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                      Ontology resources needed to resolve CURIEs in keywords and taxonomy.
                    </Text>
                    <Form.List name="resources">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item
                                label="Namespace prefix"
                                name={[name, "namespace_prefix"]}
                                rules={[{ required: true, min: 1 }]}
                              >
                                <Input placeholder="e.g. HP" />
                              </Form.Item>
                              <Form.Item label="Name" name={[name, "name"]}>
                                <Input placeholder="Human Phenotype Ontology" />
                              </Form.Item>
                              <Form.Item label="Version" name={[name, "version"]}>
                                <Input placeholder="e.g. 2024-01-01" />
                              </Form.Item>
                              <Form.Item label="URL" name={[name, "url"]}>
                                <Input placeholder="https://..." />
                              </Form.Item>
                              <Button danger size="small" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add ontology resource
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>

                  <Card title="License" style={{ marginBottom: 16 }}>
                    <Form.Item label="Label" name={["license", "label"]}>
                      <Input placeholder="e.g. Creative Commons BY 4.0" />
                    </Form.Item>
                    <Form.Item label="Type" name={["license", "type"]}>
                      <Input placeholder="e.g. CC-BY-4.0" />
                    </Form.Item>
                    <Form.Item label="URL" name={["license", "url"]}>
                      <Input placeholder="https://creativecommons.org/licenses/by/4.0/" />
                    </Form.Item>
                  </Card>

                  <Card title="Spatial Coverage">
                    <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                      Provide a place name string or a GeoJSON Feature (as JSON).
                    </Text>
                    <Form.Item label="Coverage (string)" name="spatial_coverage">
                      <Input placeholder="e.g. Canada, North America" />
                    </Form.Item>
                  </Card>
                </>
              ),
            },
            {
              key: "study",
              label: "Study Details",
              children: (
                <>
                  <Card title="Counts" style={{ marginBottom: 16 }}>
                    <Form.List name="counts">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item
                                label="Entity"
                                name={[name, "count_entity"]}
                                rules={[{ required: true, min: 1 }]}
                              >
                                <Input placeholder="e.g. participants" />
                              </Form.Item>
                              <Form.Item
                                label="Value"
                                name={[name, "value"]}
                                rules={[{ required: true }]}
                              >
                                <InputNumber style={{ width: "100%" }} placeholder="e.g. 500" />
                              </Form.Item>
                              <Form.Item
                                label="Description"
                                name={[name, "description"]}
                                rules={[{ required: true, min: 1 }]}
                              >
                                <Input placeholder="What this count represents" />
                              </Form.Item>
                              <Button danger size="small" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add count
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>

                  <Card title="Participant Criteria" style={{ marginBottom: 16 }}>
                    <Form.List name="participant_criteria">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item
                                label="Type"
                                name={[name, "type"]}
                                rules={[{ required: true }]}
                              >
                                <Select placeholder="Select type" options={criterionTypeOptions} />
                              </Form.Item>
                              <Form.Item
                                label="Description"
                                name={[name, "description"]}
                                rules={[{ required: true, min: 1 }]}
                              >
                                <TextArea rows={2} />
                              </Form.Item>
                              <Form.Item label="Link" name={[name, "link"]}>
                                <Input placeholder="https://..." />
                              </Form.Item>
                              <Button danger size="small" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add criterion
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>

                  <Card title="Extra Properties">
                    <Form.List name="extra_properties_list">
                      {(fields, { add, remove }) => (
                        <>
                          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                            Additional key-value metadata not covered by the standard schema.
                          </Text>
                          {fields.map(({ key, name }) => (
                            <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 4 }}>
                              <Form.Item name={[name, "key"]} rules={[{ required: true }]}>
                                <Input placeholder="Key" style={{ width: 200 }} />
                              </Form.Item>
                              <Form.Item name={[name, "value"]} rules={[{ required: true }]}>
                                <Input placeholder="Value" style={{ width: 300 }} />
                              </Form.Item>
                              <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                            Add property
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                </>
              ),
            },
            {
              key: "publications",
              label: "Publications & Funding",
              children: (
                <>
                  <Card title="Publications" style={{ marginBottom: 16 }}>
                    <Form.List name="publications">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" title={`Publication ${name + 1}`} style={{ marginBottom: 8 }}>
                              <Form.Item
                                label="Title"
                                name={[name, "title"]}
                                rules={[{ required: true, min: 1 }]}
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                label="URL"
                                name={[name, "url"]}
                                rules={[{ required: true, type: "url" }]}
                              >
                                <Input placeholder="https://..." />
                              </Form.Item>
                              <Form.Item label="DOI" name={[name, "doi"]}>
                                <Input placeholder="10.xxxx/xxxxx" />
                              </Form.Item>
                              <Form.Item
                                label="Publication type"
                                name={[name, "publication_type"]}
                                rules={[{ required: true }]}
                              >
                                <Select placeholder="Select type" allowClear>
                                  {publicationTypeOptions.map((o) => (
                                    <Option key={o.value} value={o.value}>
                                      {o.label}
                                    </Option>
                                  ))}
                                  <Option value="__other">Other (specify)</Option>
                                </Select>
                              </Form.Item>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prev, cur) => {
                                  const p = prev?.publications?.[name]?.publication_type;
                                  const c = cur?.publications?.[name]?.publication_type;
                                  return p !== c;
                                }}
                              >
                                {({ getFieldValue }) =>
                                  getFieldValue(["publications", name, "publication_type"]) === "__other" ? (
                                    <Form.Item
                                      label="Other publication type"
                                      name={[name, "publication_type_other"]}
                                    >
                                      <Input placeholder="Specify type" />
                                    </Form.Item>
                                  ) : null
                                }
                              </Form.Item>
                              <Form.Item label="Publication date" name={[name, "publication_date"]}>
                                <DatePicker style={{ width: "100%" }} />
                              </Form.Item>
                              <Form.Item label="Description" name={[name, "description"]}>
                                <TextArea rows={2} />
                              </Form.Item>

                              <Collapse ghost>
                                <Panel header="Venue" key="venue">
                                  <PublicationVenueFields namePrefix={["publications", name, "publication_venue"]} />
                                </Panel>
                                <Panel header="Authors" key="authors">
                                  <Form.List name={[name, "authors"]}>
                                    {(authorFields, { add: addAuthor, remove: removeAuthor }) => (
                                      <>
                                        {authorFields.map(({ key: aKey, name: aName }) => (
                                          <div key={aKey} style={{ position: "relative" }}>
                                            <PersonOrOrganizationFields
                                              namePrefix={["publications", name, "authors", aName]}
                                              form={form}
                                            />
                                            <Button
                                              danger
                                              size="small"
                                              onClick={() => removeAuthor(aName)}
                                              style={{ position: "absolute", top: 8, right: 8 }}
                                            >
                                              Remove
                                            </Button>
                                          </div>
                                        ))}
                                        <Button
                                          type="dashed"
                                          onClick={() => addAuthor({ type: "person" })}
                                          icon={<PlusOutlined />}
                                          size="small"
                                        >
                                          Add author
                                        </Button>
                                      </>
                                    )}
                                  </Form.List>
                                </Panel>
                              </Collapse>

                              <div style={{ marginTop: 8 }}>
                                <Button danger size="small" onClick={() => remove(name)}>
                                  Remove publication
                                </Button>
                              </div>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add publication
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>

                  <Card title="Funding Sources">
                    <Form.List name="funding_sources">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name }) => (
                            <Card key={key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item label="Funder name" name={[name, "funder"]}>
                                <Input placeholder="Funding organization or person name" />
                              </Form.Item>
                              <Form.List name={[name, "grant_numbers"]}>
                                {(grantFields, { add: addGrant, remove: removeGrant }) => (
                                  <>
                                    <Text strong>Grant numbers</Text>
                                    {grantFields.map(({ key: gKey, name: gName, ...gRest }) => (
                                      <Space
                                        key={gKey}
                                        align="baseline"
                                        style={{ display: "flex", marginBottom: 4 }}
                                      >
                                        <Form.Item {...gRest} name={gName}>
                                          <Input placeholder="Grant number" style={{ width: 300 }} />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => removeGrant(gName)} />
                                      </Space>
                                    ))}
                                    <Button
                                      type="dashed"
                                      onClick={() => addGrant()}
                                      icon={<PlusOutlined />}
                                      size="small"
                                    >
                                      Add grant number
                                    </Button>
                                  </>
                                )}
                              </Form.List>
                              <div style={{ marginTop: 8 }}>
                                <Button danger size="small" onClick={() => remove(name)}>
                                  Remove source
                                </Button>
                              </div>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add funding source
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                </>
              ),
            },
          ]}
        />

        {/* ============================================================= */}
        {/* Validation error display */}
        {/* ============================================================= */}
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

        {/* ============================================================= */}
        {/* Submit — hidden when embedded inside a modal */}
        {/* ============================================================= */}
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
