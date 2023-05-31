import React, {useCallback} from "react";
import PropTypes from "prop-types";

import {Button, Form, Icon, Input, Select} from "antd";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
} from "./workflowCommon";

import {nop} from "../../utils/misc";
import {workflowPropTypesShape} from "../../propTypes";
import DropBoxTreeSelect from "./DropBoxTreeSelect";


const getInputComponent = ({type, extensions, values}) => {
    const dropBoxTreeNodeEnabled = ({name, contents}) => contents !== undefined ||
        extensions.find(e => name.endsWith(e)) !== undefined;

    switch (type) {
        case "file":
        case "file[]":
            // TODO: What about non-unique files?
            // TODO: Don't hard-code configured filesystem path for input files
            return <DropBoxTreeSelect
                nodeEnabled={dropBoxTreeNodeEnabled}
                multiple={type === "file[]"}
                basePrefix="/data"
            />;

        case "enum":
            // TODO: enum[]
            return <Select>{values.map(v => <Select.Option key={v}>{v}</Select.Option>)}</Select>;

        case "number":
            return <Input type="number" />;

        // TODO: string[], enum[], number[]

        default:
            return <Input />;
    }
};

const RunSetupInputForm = ({initialValues, form, onSubmit, workflow, onBack}) => {
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            (onSubmit || nop)(values);
        });
    }, [form, onSubmit]);

    const handleBack = useCallback(() => onBack(), [onBack]);

    return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL} onSubmit={handleSubmit}>
        {[
            ...workflow.inputs.filter(i => !i.hidden).map(i => (
                <Form.Item label={i.id} key={i.id}>
                    {form.getFieldDecorator(i.id, {
                        initialValue: initialValues[i.id],  // undefined if not set
                        // Default to requiring the field unless the "required" property is set on the input
                        rules: [{required: i.required === undefined ? true : i.required}],
                    })(getInputComponent(i))}
                </Form.Item>
            )),

            <Form.Item key="_submit" wrapperCol={FORM_BUTTON_COL}>
                {onBack ? <Button icon="left" onClick={handleBack}>Back</Button> : null}
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
