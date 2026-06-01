import { Card, Form, InputNumber } from "antd";

const PhoneFields = ({ namePrefix }: { namePrefix: (string | number)[] }) => (
  <Card size="small" title="Phone" style={{ marginBottom: 8 }}>
    <Form.Item label="Country code" name={[...namePrefix, "country_code"]}>
      <InputNumber style={{ width: "100%" }} placeholder="e.g. 1" />
    </Form.Item>
    <Form.Item label="Number" name={[...namePrefix, "number"]}>
      <InputNumber style={{ width: "100%" }} placeholder="e.g. 5551234567" />
    </Form.Item>
    <Form.Item label="Extension" name={[...namePrefix, "extension"]}>
      <InputNumber style={{ width: "100%" }} placeholder="Optional" />
    </Form.Item>
  </Card>
);

export default PhoneFields;
