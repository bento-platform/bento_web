import React from "react";
import PropTypes from "prop-types";

import { Form, Input } from "antd";

const ProjectForm = ({formRef, style, initialValues}) => (
    <Form ref={formRef} initialValues={initialValues} style={style || {}} layout="vertical">
        <Form.Item label="Title" name="title" rules={[{required: true}, {min: 3}]}>
            <Input placeholder="My Health Data Project" size="large" />
        </Form.Item>
        <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Description" rows={3} />
        </Form.Item>
    </Form>
);

ProjectForm.propTypes = {
    formRef: PropTypes.object,
    style: PropTypes.object,
    initialValues: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
    }),
};

export default ProjectForm;
