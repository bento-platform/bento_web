import React from "react";
import PropTypes from "prop-types";

import { Input, Form } from "antd";

const ProjectForm = ({ style, initialValue, form }) => {
    // TODO: Unique name check

    return (
        <Form style={style || {}}>
            <Form.Item label="Title">
                {form.getFieldDecorator("title", {
                    initialValue: (initialValue || { title: "" }).title || "",
                    rules: [{ required: true }, { min: 3 }],
                })(<Input placeholder="My Health Data Project" size="large" />)}
            </Form.Item>
            <Form.Item label="Description">
                {form.getFieldDecorator("description", {
                    initialValue:
                        (initialValue || { description: "" }).description || "",
                })(<Input.TextArea placeholder="Description" rows={3} />)}
            </Form.Item>
        </Form>
    );
};

ProjectForm.propTypes = {
    style: PropTypes.object,
    initialValue: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
    }),
};

export default Form.create({ name: "project_form" })(ProjectForm);
