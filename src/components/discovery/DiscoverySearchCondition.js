import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Button, Input, Select, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import SchemaTreeSelect from "../schema_trees/SchemaTreeSelect";
import { nop } from "@/utils/misc";
import {
  DEFAULT_SEARCH_PARAMETERS,
  OP_EQUALS,
  OPERATION_TEXT,
  UI_SUPPORTED_OPERATIONS,
  getSchemaTypeTransformer,
} from "@/utils/search";

const BOOLEAN_OPTIONS = ["true", "false"];
const NEGATE_SELECT_OPTIONS = [
  { value: "pos", label: "is" },
  { value: "neg", label: "is not" },
];
const DATA_TYPE_FIELD_WIDTH = 224;
const NEGATION_WIDTH = 88;
const OPERATION_WIDTH = 116;
const CLOSE_WIDTH = 50;

const styles = {
  conditionContainer: { width: "100%" },
  schemaTreeSelect: {
    float: "left",
    width: `${DATA_TYPE_FIELD_WIDTH}px`,
    borderTopRightRadius: "0",
    borderBottomRightRadius: "0",
  },
  negationSelect: { width: `${NEGATION_WIDTH}px`, float: "left" },
  operationSelect: { width: `${OPERATION_WIDTH}px`, float: "left" },
  closeButton: { width: `${CLOSE_WIDTH}px` },
};

const DEFAULT_FIELD_SCHEMA = {
  search: { ...DEFAULT_SEARCH_PARAMETERS },
};

const fieldStateWithDefaults = ({ field, fieldSchema, negated, operation, searchValue }) => ({
  field: field ?? undefined,
  fieldSchema: fieldSchema ?? DEFAULT_FIELD_SCHEMA,
  negated: negated ?? false,
  operation: operation ?? OP_EQUALS,
  searchValue: searchValue ?? "",
});

const DiscoverySearchCondition = ({ dataType, value, onChange, onFieldChange, isExcluded, onRemoveClick }) => {
  const [fieldState, setFieldState] = useState(fieldStateWithDefaults(value));

  useEffect(() => {
    if (value) {
      setFieldState(fieldStateWithDefaults(value));
    }
  }, [value]);

  const handleChange = useCallback(
    (change) => {
      const newState = { ...fieldState, ...change };
      if (value === undefined) setFieldState(newState);
      if (onChange) onChange(newState);
    },
    [fieldState, onChange, value],
  );

  const { field, fieldSchema, operation, negated, searchValue } = fieldState;

  const handleSelectedFieldChange = useCallback(
    ({ selected: selectedField, schema: selectedFieldSchema }) => {
      if (field === selectedField) return;

      const selectedFieldOperations = selectedFieldSchema.search?.operations ?? [];

      const change = {
        field: selectedField,
        fieldSchema: selectedFieldSchema,
        searchValue: "", // Clear search value if the field changes
        // If the new field doesn't have our previously-selected operation, we replace it with the first valid
        // operation for the newly-selected field:
        operation: selectedFieldOperations.includes(operation) ? operation : selectedFieldOperations[0],
      };

      (onFieldChange ?? nop)(change);
      handleChange(change);
    },
    [handleChange, onFieldChange, field, operation],
  );

  const handleNegation = useCallback(
    (v) => {
      handleChange({ negated: v === true || v === "neg" });
    },
    [handleChange],
  );

  const handleOperation = useCallback((v) => handleChange({ operation: v }), [handleChange]);

  const handleSearchValue = useCallback(
    (e) => {
      handleChange({ searchValue: getSchemaTypeTransformer(fieldSchema.type)[0](e.target.value) });
    },
    [handleChange, fieldSchema],
  );

  const handleSearchSelectValue = useCallback(
    (sv) => {
      handleChange({ searchValue: getSchemaTypeTransformer(fieldSchema.type)[0](sv) });
    },
    [handleChange, fieldSchema],
  );

  const searchValueTransformed = useMemo(
    () => (fieldSchema ? getSchemaTypeTransformer(fieldSchema.type)[1](searchValue) : null),
    [fieldSchema, searchValue],
  );

  const operations = useMemo(() => fieldSchema.search?.operations ?? [], [fieldSchema]);
  const equalsOnly = useMemo(() => operations.includes(OP_EQUALS) && operations.length === 1, [operations]);
  const operationOptions = useMemo(
    () =>
      operations
        .filter((o) => UI_SUPPORTED_OPERATIONS.includes(o))
        .map((o) => ({ value: o, label: OPERATION_TEXT[o] ?? o })),
    [operations],
  );

  const { canNegate, required, type: fieldSchemaSearchType } = fieldSchema.search;
  const canRemove = !(fieldSchemaSearchType === "single" && required);

  // Subtract 1 from different elements' widths due to -1 margin-left
  const valueWidth =
    DATA_TYPE_FIELD_WIDTH +
    (canNegate ? NEGATION_WIDTH - 1 : 0) +
    (equalsOnly ? 0 : OPERATION_WIDTH - 1) +
    (canRemove ? CLOSE_WIDTH - 1 : 0);

  const rhsInput = useMemo(() => {
    const inputStyle = { width: `calc(100% - ${valueWidth}px)` };

    if (fieldSchema.hasOwnProperty("enum") || fieldSchema.type === "boolean") {
      // Prefix select keys in case there's a "blank" item in the enum, which throws an error
      return (
        <Select
          style={inputStyle}
          onChange={handleSearchSelectValue}
          value={searchValueTransformed}
          showSearch={true}
          filterOption={(i, o) => o.label.toLocaleLowerCase().includes(i.toLocaleLowerCase())}
          options={(fieldSchema.type === "boolean" ? BOOLEAN_OPTIONS : fieldSchema.enum).map((v) => ({
            value: v,
            label: v,
          }))}
        />
      );
    }

    return <Input style={inputStyle} placeholder="value" onChange={handleSearchValue} value={searchValueTransformed} />;
  }, [fieldSchema, valueWidth, handleSearchSelectValue, handleSearchValue, searchValueTransformed]);

  if (!fieldSchema) return <div />;

  return (
    <Space.Compact style={styles.conditionContainer}>
      <SchemaTreeSelect
        style={styles.schemaTreeSelect}
        disabled={!canRemove}
        schema={dataType?.schema}
        isExcluded={isExcluded}
        value={{ selected: field, schema: fieldSchema }}
        onChange={handleSelectedFieldChange}
      />
      {canNegate && ( // Negation
        <Select
          style={styles.negationSelect}
          value={negated ? "neg" : "pos"}
          onChange={handleNegation}
          options={NEGATE_SELECT_OPTIONS}
        />
      )}
      {!equalsOnly && ( // Operation select
        <Select
          style={styles.operationSelect}
          value={operation}
          onChange={handleOperation}
          options={operationOptions}
        />
      )}
      {rhsInput}
      {canRemove && ( // Condition removal button
        <Button icon={<CloseOutlined />} style={styles.closeButton} onClick={onRemoveClick ?? nop} />
      )}
    </Space.Compact>
  );
};

DiscoverySearchCondition.propTypes = {
  dataType: PropTypes.object,
  isExcluded: PropTypes.func,
  value: PropTypes.object,
  onFieldChange: PropTypes.func,
  onChange: PropTypes.func,
  onRemoveClick: PropTypes.func,
};

export default DiscoverySearchCondition;
