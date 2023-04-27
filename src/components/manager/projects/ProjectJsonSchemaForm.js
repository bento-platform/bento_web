import React, { useState } from "react";
import PropTypes from "prop-types";
import { Input, Form, Select, Checkbox, Upload, Empty, Icon, Typography, Tooltip } from "antd";
import ReactJson from "react-json-view";
const { Dragger } = Upload;

const defaultSchema = {
    "type": "object",
    "properties": {
        "prop_a": {
            "type": "string"
        }
    },
    "required": ["prop_a"]
}

const ProjectJsonSchemaForm = ({ projectId, schemaTypes, style }) => {
    const [schema, setSchema] = useState(defaultSchema);
    const [required, setRequired] = useState(false);
    const [schemaType, setSchemaType] = useState("")

    const onExit = () => {
        setSchema(defaultSchema);
        setRequired(false);
        setSchemaType("")
    }

    const handleSchemaUpload = () => {

    }

    return (
        <Form style={style || {}}>
            <Form.Item label={
                <Tooltip title="The data type on which this extra_properties schema will be applied">
                    Schema Type
                </Tooltip>
            }>
                <Select>
                    {schemaTypes.map(option => {
                        <Select.Option key={option} value={option}>
                            option
                        </Select.Option>
                    })}
                </Select>
            </Form.Item>
            <Form.Item label={
                <Tooltip title="Check to make the extra_properties field required">
                    <span>Required</span>
                </Tooltip>
            }>
                <Checkbox checked={required} onChange={(change => setRequired(change.target.checked))} />
            </Form.Item>
            <Form.Item label="JSON Schema">
                <Dragger name="file" accept=".json" multiple={false}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={"Drag and drop a valid JSON schema file"} />
                </Dragger>
            </Form.Item>
        </Form>
    );
};

ProjectJsonSchemaForm.propTypes = {
    projectId: PropTypes.string.isRequired,
    schemaTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    style: PropTypes.object,
};

export default Form.create({ name: "project_json_schema_form" })(ProjectJsonSchemaForm);
