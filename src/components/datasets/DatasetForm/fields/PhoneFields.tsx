import type { FC } from "react";
import { Card, Form, InputNumber } from "antd";

const PhoneFields: FC<{ namePrefix: (string | number)[] }> = ({ namePrefix }) => (
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

export default PhoneFields;
