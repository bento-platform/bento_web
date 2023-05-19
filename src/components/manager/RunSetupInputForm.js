import React, {useCallback} from "react";
import PropTypes from "prop-types";

import {Button, Form, Icon, Input, Select, TreeSelect} from "antd";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
} from "./workflowCommon";

import {nop} from "../../utils/misc";
import {workflowPropTypesShape} from "../../propTypes";


const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = (directory, valid) => [...directory].sort(sortByName).map(entry =>
    <TreeSelect.TreeNode
        title={entry.name}
        key={entry.filePath}
        value={entry.filePath}
        disabled={!valid(entry)}
        isLeaf={!entry.hasOwnProperty("contents")}
        selectable={!entry.hasOwnProperty("contents")}
    >
        {entry?.contents ? generateFileTree(entry.contents, valid) : null}
    </TreeSelect.TreeNode>);

const getInputComponent = (input, tree) => {
    switch (input.type) {
        case "file":
        case "file[]":
            // TODO: What about non-unique files?
            return <TreeSelect showSearch={true} treeDefaultExpandAll={true} multiple={input.type === "file[]"}>
                <TreeSelect.TreeNode title="Drop Box" key="root">
                    {generateFileTree(
                        tree,
                        entry => entry.hasOwnProperty("contents") ||
                            input.extensions.find(e => entry.name.endsWith(e)) !== undefined,
                    )}
                </TreeSelect.TreeNode>
            </TreeSelect>;

        case "enum":
            // TODO: enum[]
            return <Select>{input.values.map(v => <Select.Option key={v}>{v}</Select.Option>)}</Select>;

        case "number":
            return <Input type="number" />;

        // TODO: string[], enum[], number[]

        default:
            return <Input />;
    }
};

const RunSetupInputForm = ({initialValues, form, onSubmit, tree, workflow, onBack}) => {
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            (onSubmit || nop)(values);
        });
    }, [form, onSubmit]);

    return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL} onSubmit={handleSubmit}>
        {[
            ...workflow.inputs.filter(i => !i.hidden).map(i => (
                <Form.Item label={i.id} key={i.id}>
                    {form.getFieldDecorator(i.id, {
                        initialValue: initialValues[i.id],  // undefined if not set
                        // Default to requiring the field unless the "required" property is set on the input
                        rules: [{required: i.required === undefined ? true : i.required}],
                    })(getInputComponent(i, tree))}
                </Form.Item>
            )),

            <Form.Item key="_submit" wrapperCol={FORM_BUTTON_COL}>
                {onBack ? <Button icon="left" onClick={() => onBack()}>Back</Button> : null}
                <Button type="primary" htmlType="submit" style={{float: "right"}}>
                    Next <Icon type="right" />
                </Button>
            </Form.Item>,
        ]}
    </Form>;
};

RunSetupInputForm.propTypes = {
    tree: PropTypes.array,
    workflow: workflowPropTypesShape,
    initialValues: PropTypes.object,

    onBack: PropTypes.func,
    onSubmit: PropTypes.func,
};

export default Form.create({
    name: "run_setup_input_form",
    mapPropsToFields: ({workflow, formValues}) =>
        Object.fromEntries(workflow.inputs.map(i => [i.id, Form.createFormField({...formValues[i.id]})])),
    onFieldsChange: ({onChange}, _, allFields) => {
        onChange({...allFields});
    },
})(RunSetupInputForm);
