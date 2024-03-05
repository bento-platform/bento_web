import React, {Component} from "react";
import PropTypes from "prop-types";

import { Button, Input, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import SchemaTreeSelect from "../schema_trees/SchemaTreeSelect";
import {constFn, id, nop} from "@/utils/misc";
import {DEFAULT_SEARCH_PARAMETERS, OP_EQUALS, OPERATION_TEXT} from "@/utils/search";


const BOOLEAN_OPTIONS = ["true", "false"];
const DATA_TYPE_FIELD_WIDTH = 224;
const NEGATION_WIDTH = 88;
const OPERATION_WIDTH = 116;
const CLOSE_WIDTH = 50;

const toStringOrNull = x => x === null ? null : x.toString();

export const getSchemaTypeTransformer = type => {
    switch (type) {
        case "integer":
            return [s => parseInt(s, 10), toStringOrNull];
        case "number":
            return [s => parseFloat(s), toStringOrNull];
        case "boolean":
            return [s => s === "true", toStringOrNull];
        case "null":
            return  [constFn(null), constFn("null")];
        default:
            return [id, id];
    }
};


class DiscoverySearchCondition extends Component {
    static getDerivedStateFromProps(nextProps) {
        return "value" in nextProps
            ? {...(nextProps.value ?? {})}
            : null;
    }

    constructor(props) {
        super(props);

        const value = this.props.value ?? {};
        this.state = {
            field: value.field ?? undefined,

            fieldSchema: value.fieldSchema ?? {
                search: {...DEFAULT_SEARCH_PARAMETERS},
            },

            negated: value.negated ?? false,
            operation: value.operation ?? OP_EQUALS,
            searchValue: value.searchValue ?? "",

            // Non-value props
            dataType: props.dataType ?? null,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleField = (value) => {
        if (this.state.field === value.selected) return;
        const fieldOperations = value.schema.search?.operations ?? [];
        const change = {
            field: value.selected,
            fieldSchema: value.schema,
            searchValue: "",  // Clear search value if the field changes
            operation: fieldOperations.includes(this.state.operation) ? this.state.operation : fieldOperations[0],
        };

        (this.props.onFieldChange ?? nop)(change);
        this.handleChange(change);
    };

    handleNegation = (value) => {
        this.handleChange({negated: (value === true || value === "neg")});
    };

    handleOperation = (value) => {
        this.handleChange({operation: value});
    };

    handleSearchValue = (e) => {
        this.handleChange({
            searchValue: getSchemaTypeTransformer(this.state.fieldSchema.type)[0](e.target.value),
        });
    };

    handleSearchSelectValue = (searchValue) => {
        this.handleChange({
            searchValue: getSchemaTypeTransformer(this.state.fieldSchema.type)[0](searchValue),
        });
    };

    handleChange = (change) => {
        if (!("value" in this.props)) this.setState(change);
        if (this.props.onChange) this.props.onChange({...this.state, ...change});
    };

    getSearchValue() {
        return getSchemaTypeTransformer(this.state.fieldSchema.type)[1](this.state.searchValue);
    }

    equalsOnly() {
        const operations = this.state.fieldSchema.search?.operations ?? [];
        return operations.includes(OP_EQUALS) && operations.length === 1;
    }

    getRHSInput(valueWidth) {
        const { fieldSchema } = this.state;

        if (fieldSchema.hasOwnProperty("enum") || fieldSchema.type === "boolean") {
            // Prefix select keys in case there's a "blank" item in the enum, which throws an error
            return (
                 <Select style={this.getInputStyle(valueWidth)} onChange={this.handleSearchSelectValue}
                         value={this.getSearchValue()} showSearch
                         filterOption={(i, o) =>
                             o.props.children.toLocaleLowerCase().includes(i.toLocaleLowerCase())}>
                    {(fieldSchema.type === "boolean" ? BOOLEAN_OPTIONS : fieldSchema.enum)
                        .map(v => <Select.Option key={`_${v}`} value={v}>{v}</Select.Option>)}
                </Select>
            );
        }

        return (
            <Input
                style={this.getInputStyle(valueWidth)}
                placeholder="value"
                onChange={this.handleSearchValue}
                value={this.getSearchValue()}
            />
        );
    }

    getInputStyle = (valueWidth, div = 1) => ({width: `calc(${100 / div}% - ${valueWidth / div}px)`});

    render() {
        const { fieldSchema } = this.state;

        if (!fieldSchema) return <div />;

        const canRemove = !(fieldSchema.search.hasOwnProperty("type")
            && fieldSchema.search.type === "single" && fieldSchema.search.required);

        const canNegate = fieldSchema.search.canNegate;

        // Subtract 1 from different elements' widths due to -1 margin-left
        const valueWidth = DATA_TYPE_FIELD_WIDTH
            + (canNegate ? NEGATION_WIDTH - 1 : 0)
            + (this.equalsOnly() ? 0 : OPERATION_WIDTH - 1)
            + (canRemove ? CLOSE_WIDTH - 1 : 0);


        const operationOptions = fieldSchema.search.operations.map(o =>
            <Select.Option key={o}>{OPERATION_TEXT[o]}</Select.Option>);

        return <Input.Group compact>
            <SchemaTreeSelect
                style={{
                    float: "left",
                    width: `${DATA_TYPE_FIELD_WIDTH}px`,
                    borderTopRightRadius: "0",
                    borderBottomRightRadius: "0",
                }}
                disabled={!canRemove}
                schema={this.state.dataType?.schema}
                isExcluded={this.props.isExcluded}
                value={{selected: this.state.field, schema: fieldSchema}}
                onChange={v => this.handleField(v)} />
            {canNegate ? (  // Negation
                <Select style={{width: `${NEGATION_WIDTH}px`, float: "left"}}
                        value={this.state.negated ? "neg" : "pos"}
                        onChange={this.handleNegation}
                        >
                    <Select.Option key="pos">is</Select.Option>
                    <Select.Option key="neg">is not</Select.Option>
                </Select>
            ) : null}
            {this.equalsOnly() ? null : (  // Operation select
                <Select style={{width: `${OPERATION_WIDTH}px`, float: "left"}}
                        value={this.state.operation}
                        onChange={this.handleOperation}
                        >
                    {operationOptions}
                </Select>
            )}
            {this.getRHSInput(valueWidth)}
            {canRemove ? (  // Condition removal button
                <Button icon={<CloseOutlined />}
                        style={{width: `${CLOSE_WIDTH}px`}}
                        disabled={this.props.removeDisabled}
                        onClick={this.props.onRemoveClick ?? nop}
                        />
            ) : null}
        </Input.Group>;
    }
}

DiscoverySearchCondition.propTypes = {
    dataType: PropTypes.object,
    isExcluded: PropTypes.func,
    value: PropTypes.object,
    onFieldChange: PropTypes.func,
    onChange: PropTypes.func,
    onRemoveClick: PropTypes.func,
    removeDisabled: PropTypes.bool,
};

export default DiscoverySearchCondition;
