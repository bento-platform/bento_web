import React, { forwardRef, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Button, Checkbox, Form, Icon, Input, Select, Spin } from "antd";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
} from "./workflowCommon";

import {BENTO_DROP_BOX_FS_BASE_PATH} from "../../config";
import {workflowPropTypesShape} from "../../propTypes";
import {nop} from "../../utils/misc";

import DatasetTreeSelect, { ID_FORMAT_PROJECT_DATASET } from "./DatasetTreeSelect";
import DropBoxTreeSelect from "./DropBoxTreeSelect";


const EnumSelect = forwardRef(({ mode, onChange, values: valuesConfig, value }, ref) => {
    const isUrl = typeof valuesConfig === "string";

    const [values, setValues] = useState(isUrl ? [] : valuesConfig);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isUrl) {
            setFetching(true);
            fetch(valuesConfig)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setValues(data);
                    }
                    setFetching(false);
                })
                .catch(err => {
                    console.error(err);
                    setValues([]);
                    setFetching(false);
                });
        }
    }, [isUrl]);

    return (
        <Select
            mode={mode}
            ref={ref}
            value={value}
            onChange={onChange}
            notFoundContent={fetching ? <Spin size="small" /> : null}
        >
            {values.map(v => <Select.Option key={v}>{v}</Select.Option>)}
        </Select>
    );
});


const getInputComponentAndOptions = ({ id, type, pattern, values, required, repeatable }) => {
    const dropBoxTreeNodeEnabled = ({ name, contents }) =>
        contents !== undefined || !pattern || (new RegExp(pattern)).test(name);

    const options = {
        // Default to requiring the field unless the "required" property is set on the input
        rules: [{ required: required ?? true }],
    };

    const key = `input-${id}`;
    const isArray = type.endsWith("[]");

    switch (type) {
        case "string":
            return [<Input key={key} />, options];
        case "string[]": {
            // TODO: string[] - need to be able to reselect if repeatable
            return [<Select key={key} mode="tags" />, options];
        }

        case "number":
            return [<Input key={key} type="number" />, options];
        // case "number[]":

        case "boolean":
            return [<Checkbox key={key} />, { ...options, valuePropName: "checked" }];

        case "enum":
        case "enum[]": {
            const mode = (isArray && !repeatable) ? "multiple" : "default";

            // TODO: enum[] - need to be able to reselect if repeatable
            return [<EnumSelect key={key} mode={mode} values={values} />, options];
        }

        case "file":
        case "file[]":
            // TODO: What about non-unique files?
            // TODO: Don't hard-code configured filesystem path for input files
            return [
                <DropBoxTreeSelect
                    key={key}
                    basePrefix={BENTO_DROP_BOX_FS_BASE_PATH}
                    multiple={isArray}
                    nodeEnabled={dropBoxTreeNodeEnabled}
                />,
                options,
            ];

        case "directory":
        case "directory[]":
            return [
                <DropBoxTreeSelect
                    key={key}
                    basePrefix={BENTO_DROP_BOX_FS_BASE_PATH}
                    multiple={isArray}
                    folderMode={true}
                />,
                options,
            ];

        case "project:dataset":
            return [<DatasetTreeSelect key={key} idFormat={ID_FORMAT_PROJECT_DATASET} />, options];

        default:
            return [<Input key={key} />, options];
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
            ...workflow.inputs.filter(i => !i.hidden && !i.injected).map(i => {
                const [component, options] = getInputComponentAndOptions(i);

                return (
                    <Form.Item label={i.id} key={i.id}>
                        {form.getFieldDecorator(i.id, {
                            initialValue: initialValues[i.id],  // undefined if not set
                            // Default to requiring the field unless the "required" property is set on the input
                            rules: [{ required: i.required === undefined ? true : i.required }],
                            ...options,
                        })(component)}
                    </Form.Item>
                );
            }),

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
