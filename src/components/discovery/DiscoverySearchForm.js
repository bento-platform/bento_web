import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

import { Button, Dropdown, Form, Tooltip } from "antd";
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

const updateVariantConditions = (conditions, fieldName, searchValue) =>
    conditions.map((c) =>
        c.value.field === fieldName
            ? {...c, value: { ...c.value, searchValue }}
            : c);

// noinspection JSUnusedGlobalSymbols
const CONDITION_RULES = [
    {
        validator: (rule, value) => new Promise((resolve, reject) => {
            if (value.field === undefined) {
                reject("A field must be specified for this search condition.");
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
                reject(`This field is required: ${searchValue}`);
            }

            resolve();
        }),
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


const PhenopacketDropdownOption = ({ option: { path, ui_name: uiName }, getDataTypeFieldSchema }) => (
    <Tooltip title={getDataTypeFieldSchema(`[dataset item].${path}`).description}
             mouseEnterDelay={TOOLTIP_DELAY_SECONDS}>
        {uiName}
    </Tooltip>
);
PhenopacketDropdownOption.propTypes = {
    option: PropTypes.shape({
        path: PropTypes.string,
        ui_name: PropTypes.string,
    }),
    schema: PropTypes.object,
};


const DiscoverySearchForm = ({ onChange, dataType, formValues, setFormRef, handleVariantHiddenFieldChange }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (setFormRef) setFormRef(form);
    }, [form, setFormRef]);

    const [conditionsHelp, setConditionsHelp] = useState({});
    const initialValues = useRef({});

    const isPhenopacketSearch = dataType.id === "phenopacket";
    const isVariantSearch = dataType.id === "variant";

    const getDataTypeFieldSchema = useCallback((field) => {
        const fs = field ? getFieldSchema(dataType.schema, field) : {};
        return {
            ...fs,
            search: { ...DEFAULT_SEARCH_PARAMETERS, ...(fs.search ?? {}) },
        };
    }, [dataType]);

    const updateHelpFromFieldChange = useCallback((k, change) => {
        setConditionsHelp({
            ...conditionsHelp,
            [k]: change.fieldSchema.description,  // can be undefined
        });
    }, [conditionsHelp]);

    const getInitialOperator = useCallback((field, fieldSchema) => {
        if (!isVariantSearch) {
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
    }, [isVariantSearch]);

    const addCondition = useCallback((field = undefined) => {
        const existingConditions = form.getFieldValue("conditions") ?? [];
        const newKey = existingConditions.length;

        const fieldSchema = getDataTypeFieldSchema(field);

        updateHelpFromFieldChange(newKey, { fieldSchema });

        const fieldInitialValue = {
            field,
            fieldSchema,
            negated: false,
            operation:  getInitialOperator(field, fieldSchema),
            searchValue: "",
        };

        initialValues.current = {
            ...initialValues.current,
            conditions: [...(initialValues.current.conditions ?? []), fieldInitialValue],
        };

        form.setFieldsValue({
            conditions: [...existingConditions, fieldInitialValue],
        });

    }, [conditionsHelp]);

    const removeCondition = useCallback((k) => {
        form.setFieldsValue({
            conditions: (form.getFieldValue("conditions") ?? []).filter((_, i) => k !== i),
        });
    }, [form]);

    const cannotBeUsed = useCallback(
        (fieldString) => getFieldSchema(dataType.schema, fieldString).search?.type === "single",
        [dataType]);

    useEffect(() => {
        if ((form.getFieldValue("conditions") ?? []).length !== 0) return;

        const requiredFields = dataType
            ? getFields(dataType.schema).filter(
                (f) => getFieldSchema(dataType.schema, f).search?.required ?? false)
            : [];

        isVariantSearch
            ? VARIANT_REQUIRED_FIELDS
                .concat(VARIANT_OPTIONAL_FIELDS)
                .map((c) => addCondition(c))
            // currently unused, since only variant search has required fields
            : requiredFields.map((c) => addCondition(c));
    }, []);

    // methods for user-friendly variant search

    // fill hidden variant forms according to input in user-friendly variant search
    const addVariantSearchValues = useCallback((values) => {
        const { assemblyId, chrom, start, end, genotypeType, ref, alt } = values;

        let updatedConditionsArray = formValues?.conditions;

        if (updatedConditionsArray === undefined) {
            return;
        }

        // some fields may be undefined, so check for key names, not values

        if (values.hasOwnProperty("assemblyId")) {
            updatedConditionsArray = updateVariantConditions(
                updatedConditionsArray, "[dataset item].assembly_id", assemblyId);
        }

        if (values.hasOwnProperty("chrom") && values.hasOwnProperty("start") && values.hasOwnProperty("end")) {
            updatedConditionsArray = updateVariantConditions(
                updatedConditionsArray, "[dataset item].chromosome", chrom);
            updatedConditionsArray = updateVariantConditions(updatedConditionsArray, "[dataset item].start", start);
            updatedConditionsArray = updateVariantConditions(updatedConditionsArray, "[dataset item].end", end);
        }

        if (values.hasOwnProperty("genotypeType")) {
            updatedConditionsArray = updateVariantConditions(
                updatedConditionsArray, "[dataset item].calls.[item].genotype_type", genotypeType);
        }

        if (values.hasOwnProperty("ref")) {
            updatedConditionsArray = updateVariantConditions(updatedConditionsArray, "[dataset item].reference", ref);
        }

        if (values.hasOwnProperty("alt")) {
            updatedConditionsArray = updateVariantConditions(
                updatedConditionsArray, "[dataset item].alternative", alt);
        }

        handleVariantHiddenFieldChange({
            conditions: updatedConditionsArray,
        });
    }, [formValues, handleVariantHiddenFieldChange]);

    const getHelpText = useCallback(
        (key) => isVariantSearch ? "" : conditionsHelp[key] ?? undefined,
        [isVariantSearch, conditionsHelp]);

    const addConditionFromDropdown = useCallback(
        ({ key }) => addCondition(`[dataset item].${key}`),
        [addCondition]);

    const phenopacketsSearchOptions = useMemo(() => {
        const phenopacketSearchOptions = searchUiMappings.phenopacket;
        const subjectOptions = Object.values(phenopacketSearchOptions.subject);
        const phenotypicFeaturesOptions = Object.values(phenopacketSearchOptions.phenotypic_features);
        const biosamplesOptions = Object.values(phenopacketSearchOptions.biosamples);
        const diseasesOptions = Object.values(phenopacketSearchOptions.diseases);
        const interpretationOptions = Object.values(phenopacketSearchOptions.interpretations);
        const measurementsOptions = Object.values(phenopacketSearchOptions.measurements);
        const medicalActionsOptions = Object.values(phenopacketSearchOptions.medical_actions);

        const optionsMenuItems = (options) =>
            options.map((o) => ({
                key: o.path,
                label: <PhenopacketDropdownOption option={o} getDataTypeFieldSchema={getDataTypeFieldSchema} />,
            }));

        // longest title padded with marginRight
        return {
            style: { display: "inline-block" },
            onClick: addConditionFromDropdown,
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
    }, [getDataTypeFieldSchema]);

    const existingUniqueFields = (form.getFieldValue("conditions") ?? [])
        .map(({ field }) => field)
        .filter((f) => f !== undefined && cannotBeUsed(f));

    return (
        <Form form={form} onFieldsChange={(_, allFields) => onChange({...allFields})}>
            {isVariantSearch ? (
                <VariantSearchHeader
                    addVariantSearchValues={addVariantSearchValues}
                    dataType={dataType}
                />
            ) : (
                <>
                    <Form.List name="conditions">
                        {
                            /** @return React.ReactNode[] */
                            (fields) => {
                                return fields.map((field, i) => (
                                    <Form.Item
                                        key={field.key}
                                        {...field}
                                        labelCol={CONDITION_LABEL_COL}
                                        wrapperCol={CONDITION_WRAPPER_COL}
                                        label={conditionLabel(i)}
                                        help={getHelpText(i)}
                                        initialValue={initialValues.current.conditions[i]}
                                        rules={CONDITION_RULES}
                                    >
                                        <DiscoverySearchCondition
                                            dataType={dataType}
                                            isExcluded={(f) => existingUniqueFields.includes(f)}
                                            onFieldChange={(change) => updateHelpFromFieldChange(i, change)}
                                            onRemoveClick={() => removeCondition(i)}
                                        />
                                    </Form.Item>
                                ))
                            }
                        }
                    </Form.List>
                    {/*{formItems}*/}
                    <Form.Item
                        wrapperCol={{
                            xl: { span: 24 },
                            xxl: { offset: 3, span: 18 },
                        }}
                    >
                        {isPhenopacketSearch ? (
                            <Dropdown menu={phenopacketsSearchOptions}
                                      placement="bottom"
                                      trigger={["click"]}>
                                <Button type="dashed" style={{ width: "100%" }} icon={<PlusOutlined />}>
                                    Add condition
                                </Button>
                            </Dropdown>
                        ) : (
                            <Button type="dashed"
                                    onClick={() => addCondition()}
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
};

DiscoverySearchForm.propTypes = {
    form: PropTypes.object,
    onChange: PropTypes.func,
    dataType: PropTypes.object,  // TODO: Shape?
    formValues: PropTypes.object,
    setFormRef: PropTypes.func,
    handleVariantHiddenFieldChange: PropTypes.func.isRequired,
};

export default DiscoverySearchForm;
