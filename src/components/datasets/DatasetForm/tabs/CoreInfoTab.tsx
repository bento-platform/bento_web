import { Card, DatePicker, Form, Input, Select } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const CoreInfoTab = () => (
  <>
    <Card title="Core Information" style={{ marginBottom: 16 }}>
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

    <Card title="Long Description">
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
  </>
);

export default CoreInfoTab;
