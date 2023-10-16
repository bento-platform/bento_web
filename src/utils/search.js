import {simpleDeepCopy} from "./misc";

export const OP_EQUALS = "eq";
export const OP_LESS_THAN = "lt";
export const OP_LESS_THAN_OR_EQUAL = "le";
export const OP_GREATER_THAN = "gt";
export const OP_GREATER_THAN_OR_EQUAL = "ge";
export const OP_CONTAINING = "co";
export const OP_CASE_INSENSITIVE_CONTAINING = "ico";

export const OPERATION_TEXT = {
    [OP_EQUALS]: "=",
    [OP_LESS_THAN]: "<",
    [OP_LESS_THAN_OR_EQUAL]: "\u2264",
    [OP_GREATER_THAN]: ">",
    [OP_GREATER_THAN_OR_EQUAL]: "\u2265",
    [OP_CONTAINING]: "containing (case-sensitive)",
    [OP_CASE_INSENSITIVE_CONTAINING]: "containing",
};

export const DEFAULT_SEARCH_PARAMETERS = {
    operations: [OP_EQUALS, OP_LESS_THAN, OP_LESS_THAN_OR_EQUAL, OP_GREATER_THAN, OP_GREATER_THAN_OR_EQUAL,
        OP_CONTAINING, OP_CASE_INSENSITIVE_CONTAINING],
    canNegate: true,
    required: false,
    type: "unlimited",
    queryable: "all",
};

const VARIANT_OPTIONAL_FIELDS = [
    "[dataset item].calls.[item].genotype_type",
    "[dataset item].alternative",
    "[dataset item].reference",
];

export const addDataTypeFormIfPossible = (dataTypeForms, dataType) =>
    (dataTypeForms.map(d => d.dataType.id).includes(dataType.id))
        ? dataTypeForms
        : [...(dataTypeForms ?? []), {dataType, formValues: {}}];

export const updateDataTypeFormIfPossible = (dataTypeForms, dataType, fields) =>
    dataTypeForms.map(d => d.dataType.id === dataType.id
        ? {...d, formValues: simpleDeepCopy(fields)} : d);  // TODO: Hack-y deep clone

export const removeDataTypeFormIfPossible = (dataTypeForms, dataType) =>
    dataTypeForms.filter(d => d.dataType.id !== dataType.id);


export const extractQueryConditionsFromFormValues = formValues =>
    (formValues?.keys?.value ?? [])
        .map(k => formValues?.conditions?.[k] ?? null)
        .filter(c => c !== null);

export const conditionsToQuery = conditions => {

    // temp hack: remove any optional variant fields that are empty
    // greatly simplifies management of variant forms UI
    const afterVariantCleaning = conditions.filter(c =>
        (!(VARIANT_OPTIONAL_FIELDS.includes(c.value.field) && !c.value.searchValue)));

    const filteredConditions = afterVariantCleaning.filter(c => c.value && c.value.field);
    if (filteredConditions.length === 0) return null;

    return filteredConditions
        .map(({value}) =>
            (exp => value.negated ? ["#not", exp] : exp)(  // Negate expression if needed
                [`#${value.operation}`,
                    ["#resolve", ...value.field.split(".").slice(1)],
                    value.field2 ? ["#resolve", ...value.field2.split(".").slice(1)] : value.searchValue],
            ))
        .reduce((se, v) => ["#and", se, v]);
};

export const extractQueriesFromDataTypeForms = dataTypeForms => Object.fromEntries(dataTypeForms
    .map(d => [d.dataType.id, conditionsToQuery(extractQueryConditionsFromFormValues(d.formValues))])
    .filter(c => c[1] !== null));

export const searchUiMappings = {
    "phenopacket": {
        "id": "id",
        "subject": {
            "id": {
                "path": "subject.id",
                "ui_name": "Subject ID",
            },
            "sex": {
                "path": "subject.sex",
                "ui_name": "Sex",
            },
            "karyotypic_sex": {
                "path": "subject.karyotypic_sex",
                "ui_name": "Karyotypic sex",
            },
            "taxonomy": {
                "path": "subject.taxonomy.label",
                "ui_name": "Subject Taxonomy",
            },
        },
        "phenotypic_features": {
            "description": {
                "path": "phenotypic_features.[item].description",
                "ui_name": "Phenotypic feature description",
            },
            "type": {
                "path": "phenotypic_features.[item].type.label",
                "ui_name": "Phenotypic feature type",
            },
            "severity": {
                "path": "phenotypic_features.[item].severity.label",
                "ui_name": "Phenotypic feature severity",
            },
            "modifiers": {
                "path": "phenotypic_features.[item].modifiers.[item].label",
                "ui_name": "Phenotypic feature modifier",
            },
                        "onset": {
                "path": "phenotypic_features.[item].onset.label",
                "ui_name": "Phenotypic feature onset",
            },
        },
        "biosamples": {
            "description": {
                "path": "biosamples.[item].description",
                "ui_name": "Biosample description",
            },
            "sampled_tissue": {
                "path": "biosamples.[item].sampled_tissue.label",
                "ui_name": "Sampled tissue",
            },
            "taxonomy": {
                "path": "biosamples.[item].taxonomy.label",
                "ui_name": "Biosample taxonomy",
            },
            "histological_diagnosis": {
                "path": "biosamples.[item].histological_diagnosis.label",
                "ui_name": "Biosample histological diagnosis",
            },
            "tumor_progression": {
                "path": "biosamples.[item].tumor_progression.label",
                "ui_name": "Tumor progression",
            },
            "tumor_grade": {
                "path": "biosamples.[item].tumor_grade.label",
                "ui_name": "Tumor grade",
            },
            "diagnostic_markers": {
                "path": "biosamples.[item].diagnostic_markers.[item].label",
                "ui_name": "Diagnostic markers",
            },
            "procedure": {
                "path": "biosamples.[item].procedure.code.label",
                "ui_name": "Procedure",
            },
        },
        "genes": {
            "id": {
                "path": "genes.[item].id",
                "ui_name": "Gene ID",
            },
            "symbol": {
                "path": "genes.[item].symbol",
                "ui_name": "Gene symbol",
            },
        },
        "variants": {
            "zygosity": {
                "path": "variants.[item].zygosity.label",
                "ui_name": "Variant Zygosity",
            },
        },
        "diseases": {
            "term": {
                "path": "diseases.[item].term.label",
                "ui_name": "Disease",
            },
            "disease_stage": {
                "path": "diseases.[item].disease_stage.[item].label",
                "ui_name": "Disease stage",
            },
            "clinical_tnm_finding": {
                "path": "diseases.[item].clinical_tnm_finding.[item].label",
                "ui_name": "TNM finding",
            },
        },
    },
};
