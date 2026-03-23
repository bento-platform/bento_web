import { Button, Card, Form, Input, Select, Space, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

const PcglInfoTab = () => (
  <>
    <Card title="Study" style={{ marginBottom: 16 }}>
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
