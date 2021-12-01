import React, {Component} from "react";
import PropTypes from "prop-types";
import {Button, Dropdown, Form, Icon, Menu, Tooltip} from "antd";
import {getFieldSchema, getFields} from "../../utils/schema";
import {
    DEFAULT_SEARCH_PARAMETERS,
    OP_EQUALS,
    OP_LESS_THAN_OR_EQUAL,
    OP_GREATER_THAN_OR_EQUAL,
    searchUiMappings,
} from "../../utils/search";

import DiscoverySearchCondition, {getSchemaTypeTransformer} from "./DiscoverySearchCondition";
import VariantSearchHeader from "./VariantSearchHeader";

const NUM_HIDDEN_VARIANT_FORM_ITEMS = 5;
const TOOLTIP_DELAY_SECONDS = 0.8;

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

        this.state = {
            conditionsHelp: {},
            fieldSchemas: {},
            variantSearchValues: {},
            isVariantSearch: props.dataType.id === "variant",
            isPhenopacketSearch: props.dataType.id === "phenopacket",
        };
        this.initialValues = {};

        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.getDataTypeFieldSchema = this.getDataTypeFieldSchema.bind(this);
        this.addCondition = this.addCondition.bind(this);
        this.removeCondition = this.removeCondition.bind(this);
        this.addVariantSearchValues = this.addVariantSearchValues.bind(this);
    }

    componentDidMount() {
        // TODO: MAKE THIS WORK this.addCondition(); // Make sure there's one condition at least
        if (this.props.form.getFieldValue("keys").length !== 0) return;

        const requiredFields = this.props.dataType
            ? getFields(this.props.dataType.schema).filter(f =>
                getFieldSchema(this.props.dataType.schema, f).search?.required ?? false)
            : [];

        const stateUpdates = this.state.isVariantSearch
            ? this.hiddenVariantSearchFields().map((c) => this.addCondition(c, undefined, true))
            : requiredFields.map((c) => this.addCondition(c, undefined, true));

        // Add a single default condition if necessary
        // if (requiredFields.length === 0 && this.props.conditionType !== "join") {
        //     stateUpdates.push(this.addCondition(undefined, undefined, true));
        // }

        this.setState({
            ...stateUpdates.reduce((acc, v) => ({
                ...acc, conditionsHelp: {...(acc.conditionsHelp ?? {}), ...(v.conditionsHelp ?? {})}
            }), {})
        });
    }

    handleFieldChange(k, change) {
        this.setState({
            conditionsHelp: {
                ...this.state.conditionsHelp,
                [k]: change.fieldSchema.description ?? undefined,
            }
        });
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
                ...(fs.search ?? {})
            }
        };
    }

    addCondition(field = undefined, field2 = undefined, didMount = false) {
        const conditionType = this.props.conditionType ?? "data-type";

        const newKey = this.props.form.getFieldValue("keys").length;

        // TODO: What if operations is an empty list?

        const fieldSchema = conditionType === "data-type"
            ? this.getDataTypeFieldSchema(field)
            : {search: {...DEFAULT_SEARCH_PARAMETERS}};  // Join search conditions have all operators "available" TODO

        const stateUpdate = {
            conditionsHelp: {
                ...this.state.conditionsHelp,
                [newKey]: fieldSchema.description ?? undefined,
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
                operation:  this.getInitialOperator(field, fieldSchema),
                ...(conditionType === "data-type" ? {searchValue: ""} : {})
            },
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
        return fs.search?.type === "single";
    }

    isNotPublic(fieldString) {
        if (this.props.conditionType === "join") return;
        const fs = getFieldSchema(this.props.dataType.schema, fieldString);
        return ["internal", "none"].includes(fs.search?.queryable);
    }

    // methods for user-friendly variant search

    hiddenVariantSearchFields = () =>  [
        "[dataset item].assembly_id",
        "[dataset item].chromosome",
        "[dataset item].start",
        "[dataset item].end",
        "[dataset item].calls.[item].genotype_type",
    ]

    updateConditions = (conditions, fieldName, newValue) => {
        console.log({CONDITIONSIN: conditions});
        const toReturn = conditions.map((c) =>
            c.value.field === fieldName ? { ...c, value: { ...c.value, searchValue: newValue } } : c
        );
        console.log({CONDITIONSOUT: toReturn});

        return toReturn;
    }

    // fill hidden variant forms according to input in user-friendly variant search
    addVariantSearchValues = (values) => {
        this.setState({variantSearchValues: {...this.state.variantSearchValues, ...values}});

        const {assemblyId, chrom, start, end, genotypeType } = values;
        const fields = this.props.formValues;
        let updatedConditionsArray = fields.conditions;

        if (assemblyId) {
            updatedConditionsArray = this.updateConditions(
                updatedConditionsArray,
                "[dataset item].assembly_id",
                assemblyId
            );
        }

        if (genotypeType) {
            updatedConditionsArray = this.updateConditions(
                updatedConditionsArray,
                "[dataset item].calls.[item].genotype_type",
                genotypeType
            );
        }

        if (chrom && start && end) {
            updatedConditionsArray = this.updateConditions(updatedConditionsArray, "[dataset item].chromosome", chrom);
            updatedConditionsArray = this.updateConditions(updatedConditionsArray, "[dataset item].start", start);
            updatedConditionsArray = this.updateConditions(updatedConditionsArray, "[dataset item].end", end);
        }

        const updatedFields = {
            keys: fields.keys,
            conditions: updatedConditionsArray,
        };

        this.props.handleVariantHiddenFieldChange(updatedFields);
    }

    // don't count hidden variant fields
    getLabel = (i) => {
        return this.state.isVariantSearch ? `Condition ${i - 1}` : `Condition ${i + 1}`;
    }

    getHelpText = (key) => {
        return this.state.isVariantSearch ? "" : this.state.conditionsHelp[key] ?? undefined;
    }

    getInitialOperator = (field, fieldSchema) => {
        if (!this.state.isVariantSearch) {
            return fieldSchema?.search?.operations?.[0] ?? OP_EQUALS;
        }

        switch (field) {
            case "[dataset item].start":
                return OP_GREATER_THAN_OR_EQUAL;

            case "[dataset item].end":
                return OP_LESS_THAN_OR_EQUAL;

          // assemblyID, chromosome, genotype
            default:
                return OP_EQUALS;
        }
    }

    phenopacketsSearchOptions = () => {
        const phenopacketSearchOptions = searchUiMappings.phenopacket;
        const subjectOptions = Object.values(phenopacketSearchOptions.subject);
        const phenotypicFeaturesOptions = Object.values(phenopacketSearchOptions.phenotypic_features);
        const biosamplesOptions = Object.values(phenopacketSearchOptions.biosamples);
        const genesOptions = Object.values(phenopacketSearchOptions.genes);
        const variantsOptions = Object.values(phenopacketSearchOptions.variants);

        const DropdownOption = ({ option }) => {
            const schema = this.getDataTypeFieldSchema("[dataset item]." + option.path);
            return (
            <Tooltip title={schema.description} mouseEnterDelay={TOOLTIP_DELAY_SECONDS}>
              {option.ui_name}
            </Tooltip>
            );
        };

        // unstructured list style
        // const pulldownOptions = subjectOptions.concat(
        //     phenotypicFeaturesOptions,
        //     biosamplesOptions,
        //     genesOptions,
        //     variantsOptions
        // );

        // return (
        //   <Menu onClick={this.addConditionFromPulldown}>
        //     {pulldownOptions.map((o) => (
        //       <Menu.Item key={o.path}>
        //         <Tooltip title={this.phenopacketTooltipText}> {o.ui_name} </Tooltip>
        //       </Menu.Item>
        //     ))}
        //   </Menu>
        // );


        // submenu style
        return (
            <Menu style={{maxWidth: "60%" }} onClick={this.addConditionFromPulldown}>
                <Menu.SubMenu title="Subject">
                {subjectOptions.map(o => <Menu.Item key={o.path}><DropdownOption option={o}/></Menu.Item>)}
                </Menu.SubMenu>
                <Menu.SubMenu title="Phenotypic Features">
                {phenotypicFeaturesOptions.map(o => <Menu.Item key={o.path}><DropdownOption option={o}/></Menu.Item>)}
                </Menu.SubMenu>
                <Menu.SubMenu title="Biosamples">
                {biosamplesOptions.map(o => <Menu.Item key={o.path}><DropdownOption option={o}/></Menu.Item>)}
                </Menu.SubMenu>
                <Menu.SubMenu title="Genes">
                {genesOptions.map(o => <Menu.Item key={o.path}><DropdownOption option={o}/></Menu.Item>)}
                </Menu.SubMenu>
                <Menu.SubMenu title="Annotated variants">
                {variantsOptions.map(o => <Menu.Item key={o.path}><DropdownOption option={o}/></Menu.Item>)}
                </Menu.SubMenu>
            </Menu>
        );
    }

    addConditionFromPulldown = ({key}) => {
        this.addCondition("[dataset item]." + key);
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
            }} label={this.getLabel(i)} help={this.getHelpText(k)}>
                {this.props.form.getFieldDecorator(`conditions[${k}]`, {
                    initialValue: this.initialValues[`conditions[${k}]`],
                    validateTrigger: false,  // only when called manually
                    rules: CONDITION_RULES
                })(
                    <DiscoverySearchCondition conditionType={this.props.conditionType ?? "data-type"}
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
                                                      .filter(cv => cv.fieldSchema?.search?.required
                                                          && cv.field === conditionValue.field).length <= 1;
                                              })()} />
                )}
            </Form.Item>
        ));

        //for variant search, only show user-added fields, hide everything else
        const nonHiddenFields = formItems.slice(NUM_HIDDEN_VARIANT_FORM_ITEMS);

        return (
          <Form onSubmit={this.onSubmit}>
            {this.props.dataType.id === "variant" && (
              <VariantSearchHeader
                addVariantSearchValues={this.addVariantSearchValues}
                dataType={this.props.dataType}
              />
            )}
            {this.state.isVariantSearch ? nonHiddenFields : formItems}
            <Form.Item
              wrapperCol={{
                  xl: { span: 24 },
                  xxl: { offset: 3, span: 18 },
              }}
            >
              {this.state.isPhenopacketSearch ? (
                <Dropdown overlay={this.phenopacketsSearchOptions} placement="bottomCenter" >
                  <Button type="dashed" style={{ width: "100%" }}>
                    <Icon type="plus" /> Add condition
                  </Button>
                </Dropdown>
              ) : (
                <Button type="dashed" onClick={() => this.addCondition()} style={{ width: "100%" }}>
                  <Icon type="plus" /> Add condition
                </Button>
              )}
            </Form.Item>
          </Form>
        );
    }
}

DiscoverySearchForm.propTypes = {
    conditionType: PropTypes.oneOf(["data-type", "join"]),
    dataType: PropTypes.object,  // TODO: Shape?
    isInternal: PropTypes.bool,
    formValues: PropTypes.object,
    handleVariantHiddenFieldChange: PropTypes.func,
};

export default Form.create({
    mapPropsToFields: ({formValues}) => ({
        keys: Form.createFormField({...formValues.keys}),
        ...Object.assign({}, ...(formValues["conditions"] ?? [])
            .filter(c => c !== null)  // TODO: Why does this happen?
            .map(c => ({[c.name]: Form.createFormField({...c})})))
    }),
    onFieldsChange: ({onChange}, _, allFields) => {
        onChange({...allFields});
    },
})(DiscoverySearchForm);
