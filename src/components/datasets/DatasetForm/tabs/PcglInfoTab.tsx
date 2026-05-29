import { Button, Card, Form, Input, Select, Space, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

const STUDY_STATUS_OPTIONS = [
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
];

const STUDY_CONTEXT_OPTIONS = [
  { value: "CLINICAL", label: "Clinical" },
  { value: "RESEARCH", label: "Research" },
];

const PcglInfoTab = () => (
  <>
    <Card title="Study" size="small" style={{ marginBottom: 8 }}>
      <Form.Item label="Study status" name="study_status">
        <Select placeholder="Select status" allowClear options={STUDY_STATUS_OPTIONS} />
      </Form.Item>
      <Form.Item label="Study context" name="study_context">
        <Select placeholder="Select context" allowClear options={STUDY_CONTEXT_OPTIONS} />
      </Form.Item>
    </Card>

    <Card title="PCGL Fields" size="small">
      <Form.Item
        label="PCGL DAC ID"
        name="pcgl_dac_id"
        tooltip="Unique identifier of the Data Access Committee (DAC) in PCGL to which the study is assigned"
      >
        <Input />
      </Form.Item>
      <Form.Item label="PCGL Program Name" name="program_name" tooltip="The overarching program the study belongs to">
        <Input />
      </Form.Item>
      <Form.List name="domain">
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
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small" style={{ marginLeft: 8 }}>
              Add domain
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  </>
);

export default PcglInfoTab;
