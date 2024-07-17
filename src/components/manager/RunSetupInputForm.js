import React, { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import Handlebars from "handlebars";

import { Button, Checkbox, Form, Input, Select, Spin } from "antd";

import { FORM_LABEL_COL, FORM_WRAPPER_COL, FORM_BUTTON_COL } from "./workflowCommon";

import { BENTO_DROP_BOX_FS_BASE_PATH } from "@/config";
import { useBentoServices } from "@/modules/services/hooks";
import { workflowPropTypesShape } from "@/propTypes";
import { testFileAgainstPattern } from "@/utils/files";
import { nop } from "@/utils/misc";

import DatasetTreeSelect, { ID_FORMAT_PROJECT_DATASET } from "./DatasetTreeSelect";
import DropBoxTreeSelect from "./DropBoxTreeSelect";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const EnumSelect = forwardRef(({ mode, onChange, values: valuesConfig, value }, ref) => {
  const isUrl = typeof valuesConfig === "string";

  const [values, setValues] = useState(isUrl ? [] : valuesConfig);
  const [fetching, setFetching] = useState(false);
  const [attemptedFetch, setAttemptedFetch] = useState(false);

  const bentoServicesByKind = useBentoServices().itemsByKind;
  const serviceUrls = useMemo(
    () => Object.fromEntries(Object.entries(bentoServicesByKind).map(([k, v]) => [k, v.url])),
    [bentoServicesByKind],
  );

  useEffect(() => {
    // Reset attempted-fetch state when value changes
    setAttemptedFetch(false);
  }, [value]);

  useEffect(() => {
    if (isUrl && !fetching && !attemptedFetch) {
      setFetching(true);

      const url = Handlebars.compile(valuesConfig)({ serviceUrls });
      console.debug(`enum - using values URL: ${url}`);
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setValues(data);
          }
        })
        .catch((err) => {
          console.error(err);
          setValues([]);
        })
        .finally(() => {
          setAttemptedFetch(true);
          setFetching(false);
        });
    }
  }, [isUrl, fetching, attemptedFetch, valuesConfig, serviceUrls]);

  return (
    <Select
      mode={mode}
      ref={ref}
      value={value}
      onChange={onChange}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={values.map((value) => ({ value, label: value }))}
    />
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
const getInputComponentAndOptions = ({ id, type, pattern, values, repeatable }) => {
  const dropBoxTreeNodeEnabled = ({ name, contents }) =>
    contents !== undefined || testFileAgainstPattern(name, pattern);

  const key = `input-${id}`;
  const isArray = type.endsWith("[]");

  switch (type) {
    case "string":
      return [<Input key={key} />, {}];
    case "string[]": {
      // TODO: string[] - need to be able to reselect if repeatable
      return [<Select key={key} mode="tags" />, {}];
    }

    case "number":
      return [<Input key={key} type="number" />, {}];
    // case "number[]":

    case "boolean":
      return [<Checkbox key={key} />, { valuePropName: "checked" }];

    case "enum":
    case "enum[]": {
      const mode = isArray && !repeatable ? "multiple" : "default";

      // TODO: enum[] - need to be able to reselect if repeatable
      return [<EnumSelect key={key} mode={mode} values={values} />, {}];
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
        {},
      ];

    case "directory":
    case "directory[]":
      return [
        <DropBoxTreeSelect key={key} basePrefix={BENTO_DROP_BOX_FS_BASE_PATH} multiple={isArray} folderMode={true} />,
        {},
      ];

    case "project:dataset":
      return [<DatasetTreeSelect key={key} idFormat={ID_FORMAT_PROJECT_DATASET} />, {}];

    default:
      return [<Input key={key} />, {}];
  }
};

const RunSetupInputForm = ({ initialValues, onSubmit, workflow, onBack, onChange }) => {
  const handleFinish = useCallback(
    (values) => {
      (onSubmit || nop)(values);
    },
    [onSubmit],
  );

  const handleBack = useCallback(() => onBack(), [onBack]);

  const handleFieldsChange = useCallback((_, allFields) => onChange({ ...allFields }), [onChange]);

  return (
    <Form
      labelCol={FORM_LABEL_COL}
      wrapperCol={FORM_WRAPPER_COL}
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
      scrollToFirstError={true}
    >
      {[
        ...workflow.inputs
          .filter((i) => !i.hidden && !i.injected)
          .map((i) => {
            const [component, options] = getInputComponentAndOptions(i);
            return (
              <Form.Item
                key={i.id}
                label={i.id}
                name={i.id}
                initialValue={initialValues[i.id]}
                rules={
                  // Default to requiring the field unless the "required" property is set on the input
                  // or the input is a boolean (i.e., checkbox), since booleans will always be present.
                  // This does mean nullable booleans aren't supported, but that's fine since an enum is a
                  // better choice in that case anyway.
                  i.type === "boolean" ? [] : [{ required: i.required === undefined ? true : i.required }]
                }
                extra={i.help ? <span dangerouslySetInnerHTML={{ __html: i.help }} /> : undefined}
                {...options}
              >
                {component}
              </Form.Item>
            );
          }),

        <Form.Item key="_submit" wrapperCol={FORM_BUTTON_COL}>
          <>
            {" "}
            {/* Funny hack to make the type warning for multiple children in a Form.Item go away */}
            {onBack ? (
              <Button icon={<LeftOutlined />} onClick={handleBack}>
                Back
              </Button>
            ) : null}
            <Button type="primary" htmlType="submit" style={{ float: "right" }}>
              Next <RightOutlined />
            </Button>
          </>
        </Form.Item>,
      ]}
    </Form>
  );
};

RunSetupInputForm.propTypes = {
  tree: PropTypes.array,
  workflow: workflowPropTypesShape,
  initialValues: PropTypes.object.isRequired, // can be blank object but not undefined

  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
};

export default RunSetupInputForm;
