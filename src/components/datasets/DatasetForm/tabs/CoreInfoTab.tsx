import { useState } from "react";
import { Button, Card, DatePicker, Form, Input, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const LongDescriptionSection = () => {
  const form = Form.useFormInstance();
  const [isAdded, setIsAdded] = useState(() => {
    const v = form.getFieldValue("long_description");
    return !!(v?.content || v?.content_type);
  });

  const handleRemove = () => {
    form.setFieldValue(["long_description", "content"], undefined);
    form.setFieldValue(["long_description", "content_type"], undefined);
    setIsAdded(false);
  };

  return (
    <Card title="Long Description" size="small">
      {isAdded ? (
        <>
          <Form.Item label="Content" name={["long_description", "content"]} rules={[{ required: true, min: 1 }]}>
            <TextArea rows={6} placeholder="Extended description..." />
          </Form.Item>
          <Form.Item
            label="Content type"
            name={["long_description", "content_type"]}
            rules={[{ required: true, message: "Content type is required" }]}
          >
            <Select placeholder="Select content type">
              <Option value="text/plain">Plain text</Option>
              <Option value="text/markdown">Markdown</Option>
              <Option value="text/html">HTML</Option>
            </Select>
          </Form.Item>
          <Button danger size="small" onClick={handleRemove}>
            Remove
          </Button>
        </>
      ) : (
        <Button type="dashed" onClick={() => setIsAdded(true)} icon={<PlusOutlined />}>
          Add long description
        </Button>
      )}
    </Card>
  );
};

const CoreInfoTab = () => (
  <>
    <Card title="Core Information" size="small" style={{ marginBottom: 8 }}>
      <Form.Item
        label="Language"
        name="language"
        rules={[{ required: true, pattern: /^[a-z]{2}$/, message: "Expected ISO 639-1 two-letter code (e.g. en)" }]}
      >
        <Input placeholder="e.g. en" maxLength={2} style={{ width: 80 }} />
      </Form.Item>

      <Form.Item label="Title" name="title" rules={[{ required: true, min: 1, message: "Title is required" }]}>
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

      <Form.Item label="Release date" name="release_date">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Last modified" name="last_modified">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>
    </Card>

    <LongDescriptionSection />
  </>
);

export default CoreInfoTab;
