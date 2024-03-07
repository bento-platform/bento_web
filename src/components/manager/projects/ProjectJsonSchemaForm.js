import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Button, Checkbox, Form, Select, Tooltip, message } from "antd";
import { useDropzone } from "react-dropzone";
import ReactJson from "react-json-view";
import Ajv from "ajv";
import { ExtraPropertiesCode } from "./ProjectJsonSchema";

const ajv = new Ajv({
    allErrors: true,
    strict: true,
});

// Does not actually query over http, the URI is the key to the draft-07 meta-schema
const validateSchema = ajv.getSchema("http://json-schema.org/draft-07/schema");

const getSchemaTypeOptions = (schemaTypes) => {
    if (typeof schemaTypes === "object" && schemaTypes !== null) {
        return Object.entries(schemaTypes).map(([key, value]) => ({
            key,
            value: key,
            text: value.toUpperCase(),
        }));
    } else {
        return [];
    }
};

const JsonSchemaInput = ({ value, onChange }) => {
    const onDrop = useCallback((files) => {
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onabort = () => console.error("file reading was aborted");
            reader.onerror = () => console.error("file reading has failed");
            reader.onload = () => {
                const json = JSON.parse(reader.result);
                if (validateSchema(json)) {
                    // Validate against draft-07 meta schema
                    onChange(json);
                } else {
                    message.error("Selected file is an invalid JSON schema definition.");
                }
            };
            reader.readAsText(file);
        });
    }, [onChange]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            "application/json": [".json"],
        },
    });

    return (
        <div>
            <div {...getRootProps()} style={{
                border: "2px dashed #bae7ff",
                textAlign: "center",
                cursor: "pointer",
            }}>
                <input {...getInputProps()} />
                <p>Drag and drop a JSON Schema file here, or click to select files</p>
            </div>
            {value && (
                <>
                    <ReactJson src={value || {}} name={false} collapsed={true} />
                    <Button key="cancel" onClick={() => onChange(null)}>Remove</Button>
                </>
            )}
        </div>
    );
};
JsonSchemaInput.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
};

const ProjectJsonSchemaForm = ({ form, schemaTypes, initialValues }) => {
    return (
        <Form form={form}>
            <Form.Item
                label={
                    <Tooltip title={
                        <span>The data type on which this <ExtraPropertiesCode tooltip/> schema will be applied</span>
                    }>
                        Schema Type
                    </Tooltip>
                }
                name="schemaType"
                initialValue={initialValues.schemaType}
                rules={[{ required: true }]}
            >
                <Select>
                    {getSchemaTypeOptions(schemaTypes).map((option) => (
                        <Select.Option key={option.key} value={option.value}>
                            {option.text}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item label="JSON Schema" name="jsonSchema" rules={[{ required: true }]}>
                <JsonSchemaInput />
            </Form.Item>
            <Form.Item
                label={
                    <Tooltip title={
                        <span>Check to make the <ExtraPropertiesCode tooltip/> field required</span>
                    }>
                        <span>Required</span>
                    </Tooltip>
                }
                name="required"
                initialValue={initialValues.required}
                valuePropName="checked"
            >
                <Checkbox />
            </Form.Item>
        </Form >
    );
};

const JSON_SCHEMA_FORM_SHAPE = PropTypes.shape({
    schemaType: PropTypes.string,
    required: PropTypes.bool,
    jsonSchema: PropTypes.object,
});

ProjectJsonSchemaForm.propTypes = {
    form: PropTypes.object,  // FormInstance
    schemaTypes: PropTypes.objectOf(PropTypes.string).isRequired,
    initialValues: JSON_SCHEMA_FORM_SHAPE,
};

export default ProjectJsonSchemaForm;
