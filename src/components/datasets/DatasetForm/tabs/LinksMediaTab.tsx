import React from "react";
import { Button, Card, Form, Input, Select, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const LinksMediaTab = () => (
  <>
    <Card title="Links" style={{ marginBottom: 16 }}>
      <Form.List name="links">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 8 }}>
                <Form.Item label="Label" name={[name, "label"]}>
                  <Input placeholder="Link label" />
                </Form.Item>
                <Form.Item label="URL" name={[name, "url"]} rules={[{ type: "url" }]}>
                  <Input placeholder="https://..." />
                </Form.Item>
                <Button danger size="small" onClick={() => remove(name)}>
                  Remove
                </Button>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
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
                <Form.Item label="URL" name={[name, "url"]} rules={[{ required: true, type: "url" }]}>
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
                <Form.Item label="Contains text" name={[name, "contains_text"]} valuePropName="checked" initialValue={false}>
                  <Switch />
                </Form.Item>
                <Button danger size="small" onClick={() => remove(name)}>
                  Remove
                </Button>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
              Add logo
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  </>
);

export default LinksMediaTab;
