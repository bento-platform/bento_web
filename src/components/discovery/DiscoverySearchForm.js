import React, {Component} from "react";
import PropTypes from "prop-types";

import { Button, Dropdown, Tooltip } from "antd";
import { Form } from "@ant-design/compatible";
import { PlusOutlined } from "@ant-design/icons";

import {getFields, getFieldSchema} from "@/utils/schema";
import {
    DEFAULT_SEARCH_PARAMETERS,
    OP_CASE_INSENSITIVE_CONTAINING,
    OP_EQUALS,
    OP_GREATER_THAN_OR_EQUAL,
    OP_LESS_THAN_OR_EQUAL,
    searchUiMappings,
} from "@/utils/search";

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

const CONDITION_LABEL_COL = {
    lg: { span: 24 },
    xl: { span: 4 },
    xxl: { span: 3 },
};
const CONDITION_WRAPPER_COL = {
    lg: { span: 24 },
    xl: { span: 20 },
    xxl: { span: 18 },
};

const conditionLabel = (i) => `Condition ${i + 1}`;


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
        const { form, dataType } = this.props;
        const { isVariantSearch } = this.state;

        // TODO: MAKE THIS WORK this.addCondition(); // Make sure there's one condition at least
        if (form.getFieldValue("keys").length !== 0) return;

        const requiredFields = dataType
            ? getFields(dataType.schema).filter(
                (f) => getFieldSchema(dataType.schema, f).search?.required ?? false,
            )
            : [];

        const stateUpdates = isVariantSearch
            ? VARIANT_REQUIRED_FIELDS
                .concat(VARIANT_OPTIONAL_FIELDS)
                .map((c) => this.addCondition(c, true))
            // currently unused, since only variant search has required fields
            : requiredFields.map((c) => this.addCondition(c, true));

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
        const { form } = this.props;
        form.setFieldsValue({ keys: form.getFieldValue("keys").filter(key => key !== k) });
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

    addCondition(field = undefined, didMount = false) {
        const { form } = this.props;
        const { conditionsHelp } = this.state;

        // new key either 0 or max key value + 1
        const oldKeys = form.getFieldValue("keys") ?? [];
        const newKey = oldKeys.length ? oldKeys.reduce((a, b) => Math.max(a, b), 0) + 1 : 0;

        // TODO: What if operations is an empty list?

        const fieldSchema = this.getDataTypeFieldSchema(field);

        const stateUpdate = {
            conditionsHelp: {
                ...conditionsHelp,
                [newKey]: fieldSchema.description ?? undefined,
            },
        };

        if (!didMount) this.setState(stateUpdate);  // Won't fire properly in componentDidMount

        this.initialValues = {
            ...this.initialValues,
            [`conditions[${newKey}]`]: {
                field,
                fieldSchema,
                negated: false,
                operation:  this.getInitialOperator(field, fieldSchema),
                searchValue: "",
            },
        };

        // Initialize new condition, otherwise the state won't get it
        form.getFieldDecorator(`conditions[${newKey}]`, {
            initialValue: this.initialValues[`conditions[${newKey}]`],
            validateTrigger: false,  // only when called manually
            rules: CONDITION_RULES,
        });

        form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").concat(newKey),
        });

        return stateUpdate;
    }

    cannotBeUsed(fieldString) {
        const fs = getFieldSchema(this.props.dataType.schema, fieldString);
        return fs.search?.type === "single";
    }

    isNotPublic(fieldString) {
        const fs = getFieldSchema(this.props.dataType.schema, fieldString);
        return ["internal", "none"].includes(fs.search?.queryable);
    }

    // methods for user-friendly variant search

    updateConditions = (conditions, fieldName, newValue) =>
        conditions.map((c) =>
            c.value.field === fieldName ? {...c, value: {...c.value, searchValue: newValue}} : c);

    // fill hidden variant forms according to input in user-friendly variant search
    addVariantSearchValues = (values) => {
        const { formValues, handleVariantHiddenFieldChange } = this.props;
        const { assemblyId, chrom, start, end, genotypeType, ref, alt } = values;

        let updatedConditionsArray = formValues?.conditions;

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
            keys: formValues.keys,
            conditions: updatedConditionsArray,
        };

        handleVariantHiddenFieldChange(updatedFields);
    };

    getHelpText = (key) => {
        const { isVariantSearch, conditionsHelp } = this.state;
        return isVariantSearch ? "" : conditionsHelp[key] ?? undefined;
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
        this.addCondition(`[dataset item].${key}`);
    };

    render() {
        const { dataType, form, isInternal } = this.props;
        const { isPhenopacketSearch, isVariantSearch } = this.state;

        const getCondition = (ck) => form.getFieldValue(`conditions[${ck}]`);

        this.props.form.getFieldDecorator("keys", { initialValue: [] }); // Initialize keys if needed
        const keys = form.getFieldValue("keys");
        const existingUniqueFields = keys
            .filter((k) => k !== undefined)
            .map((k) => getCondition(k).field)
            .filter((f) => f !== undefined && this.cannotBeUsed(f));

        const formItems = keys.map((k, i) => (
            <Form.Item
                key={k}
                labelCol={CONDITION_LABEL_COL}
                wrapperCol={CONDITION_WRAPPER_COL}
                label={conditionLabel(i)}
                help={this.getHelpText(k)}
            >
                {form.getFieldDecorator(`conditions[${k}]`, {
                    initialValue: this.initialValues[`conditions[${k}]`],
                    validateTrigger: false, // only when called manually
                    rules: CONDITION_RULES,
                })(
                    <DiscoverySearchCondition
                        dataType={dataType}
                        isExcluded={(f) => existingUniqueFields.includes(f) || (!isInternal && this.isNotPublic(f))}
                        onFieldChange={(change) => this.handleFieldChange(k, change)}
                        onRemoveClick={() => this.removeCondition(k)}
                    />,
                )}
            </Form.Item>
        ));

        return (
            <Form onSubmit={this.onSubmit}>
                {isVariantSearch ? (
                    <VariantSearchHeader
                        addVariantSearchValues={this.addVariantSearchValues}
                        dataType={this.props.dataType}
                    />
                ) : (
                    <>
                        {formItems}
                        <Form.Item
                            wrapperCol={{
                                xl: { span: 24 },
                                xxl: { offset: 3, span: 18 },
                            }}
                        >
                            {isPhenopacketSearch ? (
                                <Dropdown menu={this.phenopacketsSearchOptions()}
                                          placement="bottom"
                                          trigger={["click"]}>
                                    <Button type="dashed" style={{ width: "100%" }} icon={<PlusOutlined />}>
                                        Add condition
                                    </Button>
                                </Dropdown>
                            ) : (
                                <Button type="dashed"
                                        onClick={() => this.addCondition()}
                                        style={{ width: "100%" }}
                                        icon={<PlusOutlined />}>
                                    Add condition
                                </Button>
                            )}
                        </Form.Item>
                    </>
                )}
            </Form>
        );
    }
}

DiscoverySearchForm.propTypes = {
    form: PropTypes.object,
    dataType: PropTypes.object,  // TODO: Shape?
    isInternal: PropTypes.bool,
    formValues: PropTypes.object,
    handleVariantHiddenFieldChange: PropTypes.func.isRequired,
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
