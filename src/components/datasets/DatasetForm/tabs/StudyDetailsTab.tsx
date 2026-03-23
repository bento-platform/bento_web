import { Button, Card, Form, Input, InputNumber, Select, Space, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { criterionTypeOptions } from "../constants";

const { TextArea } = Input;
const { Text } = Typography;

const StudyDetailsTab = () => (
  <>
    <Card title="Counts" style={{ marginBottom: 16 }}>
      <Form.List name="counts">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 8 }}>
                <Form.Item label="Entity" name={[name, "count_entity"]} rules={[{ required: true, min: 1 }]}>
                  <Input placeholder="e.g. participants" />
                </Form.Item>
                <Form.Item label="Value" name={[name, "value"]} rules={[{ required: true }]}>
                  <InputNumber style={{ width: "100%" }} placeholder="e.g. 500" />
                </Form.Item>
                <Form.Item label="Description" name={[name, "description"]} rules={[{ required: true, min: 1 }]}>
                  <Input placeholder="What this count represents" />
                </Form.Item>
                <Button danger size="small" onClick={() => remove(name)}>
                  Remove
                </Button>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
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
                <Form.Item label="Type" name={[name, "type"]} rules={[{ required: true }]}>
                  <Select placeholder="Select type" options={criterionTypeOptions} />
                </Form.Item>
                <Form.Item label="Description" name={[name, "description"]} rules={[{ required: true, min: 1 }]}>
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
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
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
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small" style={{ marginLeft: 8 }}>
              Add property
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  </>
);

export default StudyDetailsTab;
