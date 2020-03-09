import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Form, Icon} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";

import {getFieldSchema, getFields} from "../../schema";
import {DEFAULT_SEARCH_PARAMETERS, OP_EQUALS} from "../../search";

import DiscoverySearchCondition, {getSchemaTypeTransformer} from "./DiscoverySearchCondition";


// noinspection JSUnusedGlobalSymbols
const CONDITION_RULES = [
    {
        validator: (rule, value, cb) => {
            if (value.field === undefined) {
                cb("A field must be specified for this search condition.");
            }

            const searchValue = getSchemaTypeTransformer(value.fieldSchema.type)[1](value.searchValue);
            const isEnum = value.fieldSchema.hasOwnProperty("enum");

            // noinspection JSCheckFunctionSignatures
            if (searchValue === null
                    || (!isEnum && !searchValue)
                    || (isEnum && !value.fieldSchema.enum.includes(searchValue))) {
                cb("This field is required.");
            }

            cb();
        }
    }

];


class DiscoverySearchForm extends Component {
    constructor(props) {
        super(props);

        this.state = {conditionsHelp: {}, fieldSchemas: {}};
        this.initialValues = {};

        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.getDataTypeFieldSchema = this.getDataTypeFieldSchema.bind(this);
        this.addCondition = this.addCondition.bind(this);
        this.removeCondition = this.removeCondition.bind(this);
    }

    componentDidMount() {
        // TODO: MAKE THIS WORK this.addCondition(); // Make sure there's one condition at least
        if (this.props.form.getFieldValue("keys").length !== 0) return;

        const requiredFields = this.props.dataType
            ? getFields(this.props.dataType.schema).filter(f =>
                (getFieldSchema(this.props.dataType.schema, f).search || {required: false}).required || false)
            : [];

        const stateUpdates = requiredFields.map(c => this.addCondition(c, undefined, true));

        // Add a single default condition if necessary
        if (requiredFields.length === 0 && this.props.conditionType !== "join") {
            stateUpdates.push(this.addCondition(undefined, undefined, true));
        }

        this.setState({
            ...stateUpdates.reduce((acc, v) => ({
                ...acc, conditionsHelp: {...(acc.conditionsHelp || {}), ...(v.conditionsHelp || {})}
            }), {})
        });
    }

    handleFieldChange(k, change) {
        this.setState({
            conditionsHelp: {
                ...this.state.conditionsHelp,
                [k]: change.fieldSchema.description || undefined,
            }
        })
    }

    removeCondition(k) {
        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").filter(key => key !== k)
        });
    }

    getDataTypeFieldSchema(field) {
        const fs = field ? getFieldSchema(this.props.dataType.schema, field) : {};
        return {
            ...fs,
            search: {
                ...DEFAULT_SEARCH_PARAMETERS,
                ...(fs.search || {})
            }
        };
    }

    addCondition(field = undefined, field2 = undefined, didMount = false) {
        const conditionType = this.props.conditionType || "data-type";

        const newKey = this.props.form.getFieldValue("keys").length;

        // TODO: What if operations is an empty list?

        const fieldSchema = conditionType === "data-type"
            ? this.getDataTypeFieldSchema(field)
            : {search: {...DEFAULT_SEARCH_PARAMETERS}};  // Join search conditions have all operators "available" TODO

        const stateUpdate = {
            conditionsHelp: {
                ...this.state.conditionsHelp,
                [newKey]: fieldSchema.description || undefined
            }
        };

        if (!didMount) this.setState(stateUpdate);  // Won't fire properly in componentDidMount

        this.initialValues = {
            ...this.initialValues,
            [`conditions[${newKey}]`]: {
                field,
                ...(conditionType === "data-type" ? {} : {field2}),
                fieldSchema,
                negated: false,
                operation: ((fieldSchema || {search: {}}).search.operations || [OP_EQUALS])[0] || OP_EQUALS,
                ...(conditionType === "data-type" ? {searchValue: ""} : {})
            }
        };


        // Initialize new condition, otherwise the state won't get it
        this.props.form.getFieldDecorator(`conditions[${newKey}]`, {
            initialValue: this.initialValues[`conditions[${newKey}]`],
            validateTrigger: false,  // only when called manually
            rules: CONDITION_RULES,
        });

        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").concat(newKey)
        });

        return stateUpdate;
    }

    cannotBeUsed(fieldString) {
        if (this.props.conditionType === "join") return;
        const fs = getFieldSchema(this.props.dataType.schema, fieldString);
        return (fs.search || {}).type === "single";
    }

    isNotPublic(fieldString) {
        if (this.props.conditionType === "join") return;
        const fs = getFieldSchema(this.props.dataType.schema, fieldString);
        return ["internal", "none"].includes((fs.search || {}).queryable);
    }

    render() {
        const getCondition = ck => this.props.form.getFieldValue(`conditions[${ck}]`);

        this.props.form.getFieldDecorator("keys", {initialValue: []}); // Initialize keys if needed
        const keys = this.props.form.getFieldValue("keys");
        const existingUniqueFields = keys
            .filter(k => k !== undefined)
            .map(k => getCondition(k).field)
            .filter(f => f !== undefined && this.cannotBeUsed(f));

        const formItems = keys.map((k, i) => (
            <Form.Item key={k} labelCol={{
                lg: {span: 24},
                xl: {span: 4},
                xxl: {span: 3}
            }} wrapperCol={{
                lg: {span: 24},
                xl: {span: 20},
                xxl: {span: 18}
            }} label={`Condition ${i+1}`} help={this.state.conditionsHelp[k] || undefined}>
                {this.props.form.getFieldDecorator(`conditions[${k}]`, {
                    initialValue: this.initialValues[`conditions[${k}]`],
                    validateTrigger: false,  // only when called manually
                    rules: CONDITION_RULES
                })(
                    <DiscoverySearchCondition conditionType={this.props.conditionType || "data-type"}
                                              dataType={this.props.dataType}
                                              isExcluded={f => existingUniqueFields.includes(f) ||
                                                  (!this.props.isInternal && this.isNotPublic(f))}
                                              onFieldChange={change => this.handleFieldChange(k, change)}
                                              onRemoveClick={() => this.removeCondition(k)}
                                              removeDisabled={(() => {
                                                  if (this.props.conditionType === "join") return false;
                                                  if (keys.length <= 1) return true;

                                                  const conditionValue = getCondition(k);

                                                  // If no field has been selected, it's removable
                                                  if (!conditionValue.field) return false;

                                                  return keys.map(getCondition)
                                                      .filter(cv => ((cv.fieldSchema || {}).search || {}).required
                                                          && cv.field === conditionValue.field).length <= 1;
                                              })()} />
                )}
            </Form.Item>
        ));

        return (
            <Form onSubmit={this.onSubmit}>
                {formItems}
                <Form.Item wrapperCol={{
                    xl: {span: 24},
                    xxl: {offset: 3, span: 18}
                }}>
                    <Button type="dashed" onClick={() => this.addCondition()} style={{width: "100%"}}>
                        <Icon type="plus" /> Add condition
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

DiscoverySearchForm.propTypes = {
    conditionType: PropTypes.oneOf(["data-type", "join"]),
    dataType: PropTypes.object,  // TODO: Shape?
    isInternal: PropTypes.bool,
    // TODO
};

export default Form.create({
    mapPropsToFields: ({formValues}) => ({
        keys: Form.createFormField({...formValues.keys}),
        ...Object.assign({}, ...(formValues["conditions"] || [])
            .filter(c => c !== null)  // TODO: Why does this happen?
            .map(c => ({[c.name]: Form.createFormField({...c})})))
    }),
    onFieldsChange: ({onChange}, _, allFields) => {
        onChange({...allFields});
    },
})(DiscoverySearchForm);
