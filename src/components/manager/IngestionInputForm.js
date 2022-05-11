import React from "react";
import PropTypes from "prop-types";

import { Button, Form, Icon, Input, Select, TreeSelect } from "antd";

import { FORM_LABEL_COL, FORM_WRAPPER_COL, FORM_BUTTON_COL } from "./ingestion";

import { nop } from "../../utils/misc";
import { workflowPropTypesShape } from "../../propTypes";

const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = (directory, valid) =>
    [...directory].sort(sortByName).map((entry) => (
        <TreeSelect.TreeNode
            title={entry.name}
            key={entry.path}
            value={entry.path}
            disabled={!valid(entry)}
            isLeaf={!entry.hasOwnProperty("contents")}
            selectable={!entry.hasOwnProperty("contents")}
        >
            {(entry || { contents: [] }).contents
                ? generateFileTree(entry.contents, valid)
                : null}
        </TreeSelect.TreeNode>
    ));

const IngestionInputForm = ({
    form,
    tree,
    workflow,
    initialValues,
    onBack,
    onSubmit,
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            (onSubmit || nop)(values);
        });
    };

    const getInputComponent = (input) => {
        switch (input.type) {
            case "file":
            case "file[]":
                // TODO: What about non-unique files?
                return (
                    <TreeSelect
                        showSearch={true}
                        treeDefaultExpandAll={true}
                        multiple={input.type === "file[]"}
                    >
                        <TreeSelect.TreeNode title="chord_drop_box" key="root">
                            {generateFileTree(
                                tree,
                                (entry) =>
                                    entry.hasOwnProperty("contents") ||
                                    input.extensions.find((e) =>
                                        entry.name.endsWith(e)
                                    ) !== undefined
                            )}
                        </TreeSelect.TreeNode>
                    </TreeSelect>
                );

            case "enum":
                // TODO: enum[]
                return (
                    <Select>
                        {input.values.map((v) => (
                            <Select.Option key={v}>{v}</Select.Option>
                        ))}
                    </Select>
                );

            case "number":
                return <Input type="number" />;

            // TODO: string[], enum[], number[]

            default:
                return <Input />;
        }
    };

    return (
        <Form
            labelCol={FORM_LABEL_COL}
            wrapperCol={FORM_WRAPPER_COL}
            onSubmit={handleSubmit}
        >
            {[
                ...workflow.inputs.map((i) => (
                    <Form.Item label={i.id} key={i.id}>
                        {form.getFieldDecorator(i.id, {
                            initialValue: initialValues[i.id], // undefined if not set
                            // Default to requiring the field unless the "required" property is set on the input
                            rules: [
                                {
                                    required:
                                        i.required === undefined
                                            ? true
                                            : i.required,
                                },
                            ],
                        })(getInputComponent(i))}
                    </Form.Item>
                )),

                <Form.Item key="_submit" wrapperCol={FORM_BUTTON_COL}>
                    {onBack ? (
                        <Button icon="left" onClick={() => onBack()}>
                            Back
                        </Button>
                    ) : null}
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ float: "right" }}
                    >
                        Next <Icon type="right" />
                    </Button>
                </Form.Item>,
            ]}
        </Form>
    );
};

IngestionInputForm.propTypes = {
    tree: PropTypes.array,
    workflow: workflowPropTypesShape,
    initialValues: PropTypes.object,

    onBack: PropTypes.func,
    onSubmit: PropTypes.func,
};

export default Form.create({
    name: "ingestion_input_form",
    mapPropsToFields: ({ workflow, formValues }) =>
        Object.fromEntries(
            workflow.inputs.map((i) => [
                i.id,
                Form.createFormField({ ...formValues[i.id] }),
            ])
        ),
    onFieldsChange: ({ onChange }, _, allFields) => {
        onChange({ ...allFields });
    },
})(IngestionInputForm);
