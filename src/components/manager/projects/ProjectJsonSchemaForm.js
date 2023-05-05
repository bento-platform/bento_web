import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Form, Select, Checkbox, Tooltip, Button, message } from "antd";
import { useDropzone } from "react-dropzone";
import ReactJson from "react-json-view";
import Ajv from "ajv";

const ajv = new Ajv({
    allErrors: true,
    strict: true,
});

// Does not actually query over http, the URI is the key to the draft-07 meta-schema
const validateSchema = ajv.getSchema("http://json-schema.org/draft-07/schema");

const ProjectJsonSchemaForm = ({ style, schemaTypes, initialValues, setFileContent, fileContent, form }) => {

    const onDrop = useCallback((files) => {
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onabort = () => console.log("file reading was aborted");
            reader.onerror = () => console.log("file reading has failed");
            reader.onload = () => {
                const json = JSON.parse(reader.result);
                if (validateSchema(json)) {
                    // Validate against draft-07 meta schema
                    setFileContent(json);
                } else {
                    message.error("Selected file is an invalid JSON schema definition.");
                }
            };
            reader.readAsText(file);
        });
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: onDrop,
        maxFiles: 1,
        accept: {
            "application/json": [".json"]
        },
    });

    return (
        <Form style={style || {}}>
            <Form.Item label={
                <Tooltip title="The data type on which this extra_properties schema will be applied">
                    Schema Type
                </Tooltip>
            }>
                {form.getFieldDecorator("schemaType", {
                    initialValue: initialValues.schemaType,
                    rules: [{ required: true }]
                })(
                    <Select>
                        {schemaTypes.map(option => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        ))}
                    </Select>
                )}
            </Form.Item>
            <Form.Item label={
                <Tooltip title="Check to make the extra_properties field required">
                    <span>Required</span>
                </Tooltip>
            }>
                {form.getFieldDecorator("required", {
                    initialValue: initialValues.required,
                })(
                    <Checkbox />
                )}
            </Form.Item>
            <Form.Item label="JSON Schema" extra={(fileContent &&
                <Button key="cancel" onClick={() => setFileContent(null)}>Remove</Button>
            )}>
                {form.getFieldDecorator("jsonSchema", {
                    initialValue: initialValues.jsonSchema,
                    rules: [{ required: true }]
                })(
                    <>
                        <div {...getRootProps()} style={{
                            border: "2px dashed #bae7ff",
                            textAlign: "center",
                            cursor: "pointer",
                        }}>
                            <input {...getInputProps()} />
                            <p>Drag and drop a JSON Schema file here, or click to select files</p>
                        </div>
                        {fileContent && <ReactJson src={fileContent || {}} name={false} collapsed={true}/>}
                    </>
                )}
            </Form.Item>
        </Form >
    );
};

const JSON_SCHEMA_FORM_SHAPE = PropTypes.shape({
    schemaType: PropTypes.object,
    required: PropTypes.object,
    jsonSchema: PropTypes.object,
});

ProjectJsonSchemaForm.propTypes = {
    style: PropTypes.object,
    schemaTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    initialValues: JSON_SCHEMA_FORM_SHAPE,
    formValues: JSON_SCHEMA_FORM_SHAPE,
    fileContent: PropTypes.object,

    setFileContent: PropTypes.func,
};

export default Form.create({
    name: "project_json_schema_form",
    mapPropsToFields: (props) => {
        const { formValues } = props;
        // keys: Form.createFormField({ ...formValues.keys }),
        return {
            schemaType: Form.createFormField({
                ...formValues.schemaType,
                value: formValues.schemaType?.value,
            }),
            required: Form.createFormField({
                ...formValues.required,
                checked: formValues.required?.value,
            }),
            jsonSchema: Form.createFormField({
                ...formValues.jsonSchema,
                value: formValues.jsonSchema?.value,
            }),
        };
    },
    onFieldsChange: ({ onChange }, _, allFields) => {
        console.log(allFields);
        onChange({ ...allFields });
    }
})(ProjectJsonSchemaForm);
