import { Card, Form, Input, Select } from "antd";
import { venueTypeOptions } from "../constants";
import { getNestedValue } from "../helpers";

const { Option } = Select;

const PublicationVenueFields = ({
  namePrefix,
  absoluteNamePrefix,
}: {
  namePrefix: (string | number)[];
  absoluteNamePrefix?: (string | number)[];
}) => {
  const absPrefix = absoluteNamePrefix ?? namePrefix;
  return (
    <Card size="small" title="Venue" style={{ marginBottom: 8 }}>
      <Form.Item label="Venue name" name={[...namePrefix, "name"]} rules={[{ required: true, min: 1 }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Venue type" name={[...namePrefix, "venue_type"]} rules={[{ required: true }]}>
        <Select placeholder="Select venue type" allowClear>
          {venueTypeOptions.map((o) => (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          ))}
          <Option value="__other">Other (specify below)</Option>
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) => {
          const prevVal = getNestedValue(prev, [...absPrefix, "venue_type"]);
          const curVal = getNestedValue(cur, [...absPrefix, "venue_type"]);
          return prevVal !== curVal;
        }}
      >
        {({ getFieldValue }) => {
          const val = getFieldValue([...absPrefix, "venue_type"]);
          return val === "__other" ? (
            <Form.Item label="Other venue type" name={[...namePrefix, "venue_type_other"]}>
              <Input placeholder="Specify venue type" />
            </Form.Item>
          ) : null;
        }}
      </Form.Item>
      <Form.Item label="URL" name={[...namePrefix, "url"]}>
        <Input placeholder="https://..." />
      </Form.Item>
      <Form.Item label="Publisher" name={[...namePrefix, "publisher"]}>
        <Input />
      </Form.Item>
      <Form.Item label="Location" name={[...namePrefix, "location"]}>
        <Input />
      </Form.Item>
    </Card>
  );
};

export default PublicationVenueFields;
