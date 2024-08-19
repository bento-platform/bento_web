import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { Form, Input, Typography } from "antd";
import { DropBoxJsonSelect } from "../DropBoxTreeSelect";
import { useDiscoveryValidator } from "@/modules/discovery/hooks";

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
      <DropBoxJsonSelect
        form={form}
        name="discovery"
        labels={{
          parent: (
            <Typography.Title level={5} style={{ fontSize: "20px" }}>
              Public Discovery Configuration
            </Typography.Title>
          ),
          select: "Config file",
          defaultContent: "Discovery config",
          updatedContent: "New discovery config",
        }}
        initialValue={initialValues?.discovery}
        rules={[{ validator: discoveryValidator }]}
      />
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
