import React, { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import Handlebars from "handlebars";

import { Button, Checkbox, Form, Icon, Input, Select, Spin } from "antd";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
} from "./workflowCommon";

import { BENTO_DROP_BOX_FS_BASE_PATH } from "../../config";
import { workflowPropTypesShape } from "../../propTypes";
import { testFileAgainstPattern } from "../../utils/files";
import { nop } from "../../utils/misc";

import DatasetTreeSelect, { ID_FORMAT_PROJECT_DATASET } from "./DatasetTreeSelect";
import DropBoxTreeSelect from "./DropBoxTreeSelect";


const EnumSelect = forwardRef(({ mode, onChange, values: valuesConfig, value }, ref) => {
    const isUrl = typeof valuesConfig === "string";

    const [values, setValues] = useState(isUrl ? [] : valuesConfig);
    const [fetching, setFetching] = useState(false);

    const bentoServicesByKind = useSelector((state) => state.bentoServices.itemsByKind);
    const serviceUrls = useMemo(
        () => Object.fromEntries(Object.entries(bentoServicesByKind).map(([k, v]) => [k, v.url])),
        [bentoServicesByKind]);

    useEffect(() => {
        if (isUrl) {
            setFetching(true);

            const url = Handlebars.compile(valuesConfig)({ serviceUrls });
            console.debug(`enum - using values URL: ${url}`);
            fetch(url)
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
EnumSelect.propTypes = {
    mode: PropTypes.oneOf(["default", "multiple", "tags", "combobox"]),
    onChange: PropTypes.func,
    values: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
};


// These properties come from the inputs as listed in the WorkflowDefinition in the workflow-providing service.
// For all possible workflow input types, see:
// https://github.com/bento-platform/bento_lib/blob/master/bento_lib/workflows/models.py
// This component is responsible for transforming these workflow input definitions into form elements.
const getInputComponentAndOptions = ({ id, type, pattern, values, required, repeatable }) => {
    const dropBoxTreeNodeEnabled = ({ name, contents }) =>
        contents !== undefined || testFileAgainstPattern(name, pattern);

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
                    <Form.Item
                        label={i.id}
                        key={i.id}
                        extra={i.help ? <span dangerouslySetInnerHTML={{ __html: i.help }} /> : undefined}
                    >
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
                <> {/* Funny hack to make the type warning for multipe children in a Form.Item go away */}
                    {onBack ? <Button icon="left" onClick={handleBack}>Back</Button> : null}
                    <Button type="primary" htmlType="submit" style={{float: "right"}}>
                        Next <Icon type="right" />
                    </Button>
                </>
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
        Object.fromEntries((workflow?.inputs ?? []).map(i => [i.id, Form.createFormField({...formValues[i.id]})])),
    onFieldsChange: ({onChange}, _, allFields) => {
        onChange({...allFields});
    },
})(RunSetupInputForm);
