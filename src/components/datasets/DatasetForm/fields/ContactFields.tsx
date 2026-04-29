import { Button, Card, Form, Input, Space, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import PhoneFields from "./PhoneFields";

const { TextArea } = Input;
const { Text } = Typography;

const ContactFields = ({ namePrefix }: { namePrefix: (string | number)[] }) => (
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
          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small" style={{ marginLeft: 8 }}>
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

export default ContactFields;
