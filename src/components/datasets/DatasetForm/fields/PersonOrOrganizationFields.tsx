import React, { useMemo } from "react";
import { Button, Card, Collapse, Form, Input, Radio, Select, Space, Typography } from "antd";
import { BankOutlined, MinusCircleOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import { roleOptions } from "../constants";
import ContactFields from "./ContactFields";

const { Panel } = Collapse;
const { Text } = Typography;

const PersonFields: React.FC<{ namePrefix: (string | number)[] }> = ({ namePrefix }) => (
  <>
    <Form.Item name={[...namePrefix, "type"]} hidden>
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
          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small" style={{ marginLeft: 8 }}>
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

const OrganizationFields: React.FC<{ namePrefix: (string | number)[] }> = ({ namePrefix }) => (
  <>
    <Form.Item name={[...namePrefix, "type"]} hidden>
      <Input />
    </Form.Item>
    <Form.Item label="Name" name={[...namePrefix, "name"]} rules={[{ required: true, min: 1 }]}>
      <Input placeholder="Organization name" />
    </Form.Item>
    <Form.Item label="Description" name={[...namePrefix, "description"]}>
      <Input.TextArea rows={2} />
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

const PersonOrOrganizationFields: React.FC<{
  namePrefix: (string | number)[];
  /** Absolute path from the form root — needed when namePrefix is relative (inside a Form.List). Defaults to namePrefix. */
  absoluteNamePrefix?: (string | number)[];
  form: FormInstance;
}> = ({ namePrefix, absoluteNamePrefix, form }) => {
  const watchPrefix = absoluteNamePrefix ?? namePrefix;
  // Memoize the path so Form.useWatch doesn't re-subscribe on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const typePath = useMemo(() => [...watchPrefix, "type"], [JSON.stringify(watchPrefix)]);
  const typeValue = Form.useWatch(typePath, form) ?? "person";

  return (
    <Card size="small" style={{ marginBottom: 8 }}>
      <Form.Item label="Type" name={[...namePrefix, "type"]} initialValue="person">
        <Radio.Group
          onChange={(e) => {
            const current = form.getFieldValue(namePrefix as string[]);
            const roles = current?.roles;
            const name = current?.name;
            form.setFieldValue(namePrefix as string[], { type: e.target.value, name, roles });
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

export default PersonOrOrganizationFields;
