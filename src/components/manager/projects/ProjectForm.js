import React, {Component} from "react";
import PropTypes from "prop-types";

import {Input} from "antd";
import { Form } from "@ant-design/compatible";

class ProjectForm extends Component {
    // TODO: Unique name check
    render() {
        return <Form style={this.props.style || {}}>
            <Form.Item label="Title">
                {this.props.form.getFieldDecorator("title", {
                    initialValue: (this.props.initialValue || {title: ""}).title || "",
                    rules: [{required: true}, {min: 3}],
                })(<Input placeholder="My Health Data Project" size="large" />)}
            </Form.Item>
            <Form.Item label="Description">
                {this.props.form.getFieldDecorator("description", {
                    initialValue: (this.props.initialValue || {description: ""}).description || "",
                })(<Input.TextArea placeholder="Description" rows={3} />)}
            </Form.Item>
        </Form>;
    }
}

ProjectForm.propTypes = {
    style: PropTypes.object,
    initialValue: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
    }),
};

export default Form.create({name: "project_form"})(ProjectForm);
