import React, {Component} from "react";
import PropTypes from "prop-types";

import { Button, Dropdown, Tooltip } from "antd";
import { Form } from "@ant-design/compatible";
import { PlusOutlined } from "@ant-design/icons";

import {getFields, getFieldSchema} from "../../utils/schema";
import {
    DEFAULT_SEARCH_PARAMETERS,
    OP_CASE_INSENSITIVE_CONTAINING,
    OP_EQUALS,
    OP_GREATER_THAN_OR_EQUAL,
    OP_LESS_THAN_OR_EQUAL,
    searchUiMappings,
} from "../../utils/search";

import DiscoverySearchCondition, {getSchemaTypeTransformer} from "./DiscoverySearchCondition";
import VariantSearchHeader from "./VariantSearchHeader";

const TOOLTIP_DELAY_SECONDS = 0.8;

// required by ui not precisely the same as required in spec, possible TODO
const VARIANT_REQUIRED_FIELDS = [
    "[dataset item].assembly_id",
    "[dataset item].chromosome",
    "[dataset item].start",
    "[dataset item].end",
];

const VARIANT_OPTIONAL_FIELDS = [
    "[dataset item].calls.[item].genotype_type",
    "[dataset item].alternative",
    "[dataset item].reference",
];

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
            if (
                !VARIANT_OPTIONAL_FIELDS.includes(value.field) &&
                (searchValue === null ||
                    (!isEnum && !searchValue) ||
                    (isEnum && !value.fieldSchema.enum.includes(searchValue)))
            ) {
                cb(`This field is required: ${searchValue}`);
            }

            cb();
        },
    },

];


class DiscoverySearchForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            conditionsHelp: {},
            fieldSchemas: {},
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
            ? getFields(this.props.dataType.schema).filter(
                (f) => getFieldSchema(this.props.dataType.schema, f).search?.required ?? false,
            )
            : [];

        const stateUpdates = this.state.isVariantSearch
            ? VARIANT_REQUIRED_FIELDS
                .concat(VARIANT_OPTIONAL_FIELDS)
                .map((c) => this.addCondition(c, undefined, true))
            // currently unused, since only variant search has required fields
            : requiredFields.map((c) => this.addCondition(c, undefined, true));

        // Add a single default condition if necessary
        // if (requiredFields.length === 0 && this.props.conditionType !== "join") {
        //     stateUpdates.push(this.addCondition(undefined, undefined, true));
        // }

        this.setState({
            ...stateUpdates.reduce((acc, v) => ({
                ...acc, conditionsHelp: {...(acc.conditionsHelp ?? {}), ...(v.conditionsHelp ?? {})},
            }), {}),
        });
    }

    handleFieldChange(k, change) {
        this.setState({
            conditionsHelp: {
                ...this.state.conditionsHelp,
                [k]: change.fieldSchema.description ?? undefined,
            },
        });
    }


    removeCondition(k) {
        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").filter(key => key !== k),
        });
    }

    getDataTypeFieldSchema(field) {
        const fs = field ? getFieldSchema(this.props.dataType.schema, field) : {};
        return {
            ...fs,
            search: {
                ...DEFAULT_SEARCH_PARAMETERS,
                ...(fs.search ?? {}),
            },
        };
    }

    addCondition(field = undefined, field2 = undefined, didMount = false) {
        const conditionType = this.props.conditionType ?? "data-type";

        // new key either 0 or max key value + 1
        const oldKeys = this.props.form.getFieldValue("keys") ?? [];
        const newKey = oldKeys.length ? oldKeys.reduce((a, b) => Math.max(a, b), 0) + 1 : 0;

        // TODO: What if operations is an empty list?

        const fieldSchema = conditionType === "data-type"
            ? this.getDataTypeFieldSchema(field)
            : {search: {...DEFAULT_SEARCH_PARAMETERS}};  // Join search conditions have all operators "available" TODO

        const stateUpdate = {
            conditionsHelp: {
                ...this.state.conditionsHelp,
                [newKey]: fieldSchema.description ?? undefined,
            },
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
                ...(conditionType === "data-type" ? {searchValue: ""} : {}),
            },
        };

        // Initialize new condition, otherwise the state won't get it
        this.props.form.getFieldDecorator(`conditions[${newKey}]`, {
            initialValue: this.initialValues[`conditions[${newKey}]`],
            validateTrigger: false,  // only when called manually
            rules: CONDITION_RULES,
        });

        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").concat(newKey),
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

    updateConditions = (conditions, fieldName, newValue) =>
        conditions.map((c) =>
            c.value.field === fieldName ? {...c, value: {...c.value, searchValue: newValue}} : c);

    // fill hidden variant forms according to input in user-friendly variant search
    addVariantSearchValues = (values) => {
        const {assemblyId, chrom, start, end, genotypeType, ref, alt } = values;
        const fields = this.props.formValues;
        let updatedConditionsArray = fields?.conditions;

        if (updatedConditionsArray === undefined) {
            return;
        }

        // some fields may be undefined, so check for key names, not values

        if (values.hasOwnProperty("assemblyId")) {
            updatedConditionsArray = this.updateConditions(
                updatedConditionsArray,
                "[dataset item].assembly_id",
                assemblyId,
            );
        }

        if (values.hasOwnProperty("chrom") && values.hasOwnProperty("start") && values.hasOwnProperty("end")) {
            updatedConditionsArray = this.updateConditions(updatedConditionsArray, "[dataset item].chromosome", chrom);
            updatedConditionsArray = this.updateConditions(updatedConditionsArray, "[dataset item].start", start);
            updatedConditionsArray = this.updateConditions(updatedConditionsArray, "[dataset item].end", end);
        }

        if (values.hasOwnProperty("genotypeType")) {
            updatedConditionsArray = this.updateConditions(
                updatedConditionsArray,
                "[dataset item].calls.[item].genotype_type",
                genotypeType,
            );
        }

        if (values.hasOwnProperty("ref")) {
            updatedConditionsArray = this.updateConditions(updatedConditionsArray, "[dataset item].reference", ref);
        }

        if (values.hasOwnProperty("alt")) {
            updatedConditionsArray = this.updateConditions(updatedConditionsArray, "[dataset item].alternative", alt);
        }

        const updatedFields = {
            keys: fields.keys,
            conditions: updatedConditionsArray,
        };

        this.props.handleVariantHiddenFieldChange(updatedFields);
    };

    getLabel = (i) => {
        return `Condition ${i + 1}`;
    };

    getHelpText = (key) => {
        return this.state.isVariantSearch ? "" : this.state.conditionsHelp[key] ?? undefined;
    };

    getInitialOperator = (field, fieldSchema) => {
        if (!this.state.isVariantSearch) {
            return fieldSchema?.search?.operations?.includes(OP_CASE_INSENSITIVE_CONTAINING)
                ? OP_CASE_INSENSITIVE_CONTAINING
                : OP_EQUALS;
        }

        switch (field) {
            case "[dataset item].start":
                return OP_GREATER_THAN_OR_EQUAL;

            case "[dataset item].end":
                return OP_LESS_THAN_OR_EQUAL;

          // assemblyID, chromosome, genotype, ref, alt
            default:
                return OP_EQUALS;
        }
    };

    phenopacketsSearchOptions = () => {
        const phenopacketSearchOptions = searchUiMappings.phenopacket;
        const subjectOptions = Object.values(phenopacketSearchOptions.subject);
        const phenotypicFeaturesOptions = Object.values(phenopacketSearchOptions.phenotypic_features);
        const biosamplesOptions = Object.values(phenopacketSearchOptions.biosamples);
        const diseasesOptions = Object.values(phenopacketSearchOptions.diseases);
        const interpretationOptions = Object.values(phenopacketSearchOptions.interpretations);
        const measurementsOptions = Object.values(phenopacketSearchOptions.measurements);
        const medicalActionsOptions = Object.values(phenopacketSearchOptions.medical_actions);

        // eslint-disable-next-line react/prop-types
        const DropdownOption = ({option: {path, ui_name: uiName}}) => {
            const schema = this.getDataTypeFieldSchema(`[dataset item].${path}`);
            return (
                <Tooltip title={schema.description} mouseEnterDelay={TOOLTIP_DELAY_SECONDS}>
                    {uiName}
                </Tooltip>
            );
        };
        DropdownOption.propTypes = {
            option: PropTypes.shape({
                path: PropTypes.string,
                ui_name: PropTypes.string,
            }),
        };

        const optionsMenuItems = (options) =>
            options.map((o) => ({
                key: o.path,
                label: <DropdownOption option={o} />,
            }));

        // longest title padded with marginRight
        return {
            style: { display: "inline-block" },
            onClick: this.addConditionFromPulldown,
            items: [
                {
                    key: "subject",
                    label: <span>Subject</span>,
                    children: optionsMenuItems(subjectOptions),
                },
                {
                    key: "phenotypicFeatures",
                    label: <span style={{ marginRight: "10px" }}>Phenotypic Features </span>,
                    children: optionsMenuItems(phenotypicFeaturesOptions),
                },
                {
                    key: "biosamples",
                    label: <span>Biosamples</span>,
                    children: optionsMenuItems(biosamplesOptions),
                },
                {
                    key: "measurements",
                    label: <span>Measurements</span>,
                    children: optionsMenuItems(measurementsOptions),
                },
                {
                    key: "diseases",
                    label: <span>Diseases</span>,
                    children: optionsMenuItems(diseasesOptions),
                },
                {
                    key: "interpretations",
                    label: <span>Interpretations</span>,
                    children: optionsMenuItems(interpretationOptions),
                },
                {
                    key: "medicalActions",
                    label: <span>Medical Actions</span>,
                    children: optionsMenuItems(medicalActionsOptions),
                },
            ],
        };
    };

    addConditionFromPulldown = ({ key }) => {
        this.addCondition("[dataset item]." + key);
    };

    render() {
        const getCondition = (ck) => this.props.form.getFieldValue(`conditions[${ck}]`);

        this.props.form.getFieldDecorator("keys", { initialValue: [] }); // Initialize keys if needed
        const keys = this.props.form.getFieldValue("keys");
        const existingUniqueFields = keys
            .filter((k) => k !== undefined)
            .map((k) => getCondition(k).field)
            .filter((f) => f !== undefined && this.cannotBeUsed(f));

        const formItems = keys.map((k, i) => (
            <Form.Item
                key={k}
                labelCol={{
                    lg: { span: 24 },
                    xl: { span: 4 },
                    xxl: { span: 3 },
                }}
                wrapperCol={{
                    lg: { span: 24 },
                    xl: { span: 20 },
                    xxl: { span: 18 },
                }}
                label={this.getLabel(i)}
                help={this.getHelpText(k)}
            >
                {this.props.form.getFieldDecorator(`conditions[${k}]`, {
                    initialValue: this.initialValues[`conditions[${k}]`],
                    validateTrigger: false, // only when called manually
                    rules: CONDITION_RULES,
                })(
                    <DiscoverySearchCondition
                        conditionType={this.props.conditionType ?? "data-type"}
                        dataType={this.props.dataType}
                        isExcluded={(f) =>
                            existingUniqueFields.includes(f) || (!this.props.isInternal && this.isNotPublic(f))
                        }
                        onFieldChange={(change) => this.handleFieldChange(k, change)}
                        onRemoveClick={() => this.removeCondition(k)}
                        removeDisabled={false}
                    />,
                )}
            </Form.Item>
        ));

        return (
            <Form onSubmit={this.onSubmit}>
                {this.props.dataType.id === "variant" && (
                    <VariantSearchHeader
                        addVariantSearchValues={this.addVariantSearchValues}
                        dataType={this.props.dataType}
                    />
                )}
                {this.state.isVariantSearch ? [] : formItems}
                <Form.Item
                    wrapperCol={{
                        xl: { span: 24 },
                        xxl: { offset: 3, span: 18 },
                    }}
                >
                    {this.state.isVariantSearch ? (
                        <></>
                    ) : this.state.isPhenopacketSearch ? (
                        <Dropdown menu={this.phenopacketsSearchOptions()} placement="bottom" trigger={["click"]}>
                            <Button type="dashed" style={{ width: "100%" }}>
                                <PlusOutlined /> Add condition
                            </Button>
                        </Dropdown>
                    ) : (
                        <Button type="dashed" onClick={() => this.addCondition()} style={{ width: "100%" }}>
                            <PlusOutlined /> Add condition
                        </Button>
                    )}
                </Form.Item>
            </Form>
        );
    }
}

DiscoverySearchForm.propTypes = {
    form: PropTypes.object,
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
            .map(c => ({[c.name]: Form.createFormField({...c})}))),
    }),
    onFieldsChange: ({onChange}, _, allFields) => {
        onChange({...allFields});
    },
})(DiscoverySearchForm);
