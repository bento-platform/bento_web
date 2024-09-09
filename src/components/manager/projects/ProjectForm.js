import { useEffect } from "react";
import PropTypes from "prop-types";

import { Form, Input } from "antd";

import { useDiscoveryValidator } from "@/modules/metadata/hooks";

import DropBoxJsonSelect from "../dropBox/DropBoxJsonSelect";

const ProjectForm = ({ form, style, initialValues }) => {
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);
  const discoveryValidator = useDiscoveryValidator();
  return (
    <Form form={form} style={style || {}} layout="vertical" initialValues={initialValues}>
      <Form.Item label="Title" name="title" rules={[{ required: true }, { min: 3 }]}>
        <Input placeholder="My Health Data Project" size="large" />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <Input.TextArea placeholder="Description" rows={3} />
      </Form.Item>
      <Form.Item label="Discovery Configuration" name="discovery" rules={[{ validator: discoveryValidator }]}>
        <DropBoxJsonSelect initialValue={initialValues?.discovery} />
      </Form.Item>
    </Form>
  );
};

ProjectForm.propTypes = {
  form: PropTypes.object,
  style: PropTypes.object,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    discovery: PropTypes.object,
  }),
};

export default ProjectForm;
