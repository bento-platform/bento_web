import { constFn, id, simpleDeepCopy } from "./misc";

export const OP_EQUALS = "eq";
export const OP_LESS_THAN = "lt";
export const OP_LESS_THAN_OR_EQUAL = "le";
export const OP_GREATER_THAN = "gt";
export const OP_GREATER_THAN_OR_EQUAL = "ge";
export const OP_CONTAINING = "co";
export const OP_CASE_INSENSITIVE_CONTAINING = "ico";
export const OP_CASE_INSENSITIVE_STARTS_WITH = "isw";
export const OP_CASE_INSENSITIVE_ENDS_WITH = "iew";
export const OP_CASE_INSENSITIVE_LIKE = "ilike";

export const OPERATION_TEXT = {
  [OP_EQUALS]: "=",
  [OP_LESS_THAN]: "<",
  [OP_LESS_THAN_OR_EQUAL]: "\u2264",
  [OP_GREATER_THAN]: ">",
  [OP_GREATER_THAN_OR_EQUAL]: "\u2265",
  [OP_CONTAINING]: "containing (case-sensitive)",
  [OP_CASE_INSENSITIVE_CONTAINING]: "containing",
  [OP_CASE_INSENSITIVE_STARTS_WITH]: "starting with",
  [OP_CASE_INSENSITIVE_ENDS_WITH]: "ending with",
  [OP_CASE_INSENSITIVE_LIKE]: "SQL—ILIKE",
};
export const UI_SUPPORTED_OPERATIONS = Object.keys(OPERATION_TEXT);

export const DEFAULT_SEARCH_PARAMETERS = {
  operations: [
    OP_EQUALS,
    OP_LESS_THAN,
    OP_LESS_THAN_OR_EQUAL,
    OP_GREATER_THAN,
    OP_GREATER_THAN_OR_EQUAL,
    OP_CONTAINING,
    OP_CASE_INSENSITIVE_CONTAINING,
  ],
  canNegate: true,
  required: false,
  type: "unlimited",
  queryable: "all",
};

export const VARIANT_REQUIRED_FIELDS = [
  "[dataset item].assembly_id",
  "[dataset item].chromosome",
  "[dataset item].start",
  "[dataset item].end", //always filled in UI but not required in spec
];

export const VARIANT_OPTIONAL_FIELDS = [
  "[dataset item].calls.[item].genotype_type",
  "[dataset item].alternative",
  "[dataset item].reference",
];

export const addDataTypeFormIfPossible = (dataTypeForms, dataType) =>
  dataTypeForms.map((d) => d.dataType.id).includes(dataType.id)
    ? dataTypeForms
    : [...(dataTypeForms ?? []), { dataType, formValues: [] }];

export const updateDataTypeFormIfPossible = (dataTypeForms, dataType, fields) =>
  dataTypeForms.map((d) => (d.dataType.id === dataType.id ? { ...d, formValues: simpleDeepCopy(fields) } : d)); // TODO: Hack-y deep clone

export const removeDataTypeFormIfPossible = (dataTypeForms, dataType) =>
  dataTypeForms.filter((d) => d.dataType.id !== dataType.id);

export const extractQueryConditionsFromFormValues = (formValues) => formValues[0]?.value ?? [];

export const conditionsToQuery = (conditions) => {
  // temp hack: remove any optional variant fields that are empty
  // greatly simplifies management of variant forms UI
  const afterVariantCleaning = conditions.filter(
    ({ field, searchValue }) => !(VARIANT_OPTIONAL_FIELDS.includes(field) && !searchValue),
  );

  const filteredConditions = afterVariantCleaning.filter((c) => c.field);
  if (filteredConditions.length === 0) return null;

  return filteredConditions
    .map(({ field, negated, operation, searchValue }) =>
      ((exp) => (negated ? ["#not", exp] : exp))(
        // Negate expression if needed
        [`#${operation}`, ["#resolve", ...field.split(".").slice(1)], searchValue],
      ),
    )
    .reduce((se, v) => ["#and", se, v]);
};

export const extractQueriesFromDataTypeForms = (dataTypeForms) =>
  Object.fromEntries(
    dataTypeForms
      .map((d) => [d.dataType.id, conditionsToQuery(extractQueryConditionsFromFormValues(d.formValues))])
      .filter((c) => c[1] !== null),
  );

const toStringOrNull = (x) => (x === null ? null : x.toString());

export const getSchemaTypeTransformer = (type) => {
  switch (type) {
    case "integer":
      return [(s) => parseInt(s, 10), toStringOrNull];
    case "number":
      return [(s) => parseFloat(s), toStringOrNull];
    case "boolean":
      return [(s) => s === "true", toStringOrNull];
    case "null":
      return [constFn(null), constFn("null")];
    default:
      return [id, id];
  }
};

export const conditionValidator = (_, { field, fieldSchema, searchValue }) => {
  if (field === undefined) {
    return Promise.reject("A field must be specified for this search condition.");
  }

  const transformedSearchValue = getSchemaTypeTransformer(fieldSchema.type)[1](searchValue);
  const isEnum = fieldSchema.hasOwnProperty("enum");
  const isString = fieldSchema.type === "string";

  // noinspection JSCheckFunctionSignatures
  if (
    !VARIANT_OPTIONAL_FIELDS.includes(field) &&
    (transformedSearchValue === null ||
      (!isEnum && !transformedSearchValue) ||
      (!isEnum && isString && !transformedSearchValue.trim()) || // Forbid whitespace-only free-text searches
      (isEnum && !fieldSchema.enum.includes(transformedSearchValue)))
  ) {
    return Promise.reject(`This field must have a value: ${field}`);
  }

  return Promise.resolve();
};

export const searchUiMappings = {
  phenopacket: {
    id: "id",
    subject: {
      id: {
        path: "subject.id",
        ui_name: "Subject ID",
      },
      sex: {
        path: "subject.sex",
        ui_name: "Sex",
      },
      karyotypic_sex: {
        path: "subject.karyotypic_sex",
        ui_name: "Karyotypic sex",
      },
      taxonomy: {
        path: "subject.taxonomy.label",
        ui_name: "Subject Taxonomy",
      },
    },
    phenotypic_features: {
      description: {
        path: "phenotypic_features.[item].description",
        ui_name: "Phenotypic feature description",
      },
      type: {
        path: "phenotypic_features.[item].type.label",
        ui_name: "Phenotypic feature type",
      },
      severity: {
        path: "phenotypic_features.[item].severity.label",
        ui_name: "Phenotypic feature severity",
      },
      modifiers: {
        path: "phenotypic_features.[item].modifiers.[item].label",
        ui_name: "Phenotypic feature modifier",
      },
      // TODO: new search for Phenopacket TimeElement
      // "onset": {
      //     "path": "phenotypic_features.[item].onset.label",
      //     "ui_name": "Phenotypic feature onset",
      // },
    },
    biosamples: {
      description: {
        path: "biosamples.[item].description",
        ui_name: "Biosample description",
      },
      sampled_tissue: {
        path: "biosamples.[item].sampled_tissue.label",
        ui_name: "Sampled tissue",
      },
      taxonomy: {
        path: "biosamples.[item].taxonomy.label",
        ui_name: "Biosample taxonomy",
      },
      histological_diagnosis: {
        path: "biosamples.[item].histological_diagnosis.label",
        ui_name: "Biosample histological diagnosis",
      },
      tumor_progression: {
        path: "biosamples.[item].tumor_progression.label",
        ui_name: "Tumor progression",
      },
      tumor_grade: {
        path: "biosamples.[item].tumor_grade.label",
        ui_name: "Tumor grade",
      },
      diagnostic_markers: {
        path: "biosamples.[item].diagnostic_markers.[item].label",
        ui_name: "Diagnostic markers",
      },
      procedure: {
        path: "biosamples.[item].procedure.code.label",
        ui_name: "Procedure",
      },
    },
    diseases: {
      term: {
        path: "diseases.[item].term.label",
        ui_name: "Disease",
      },
      disease_stage: {
        path: "diseases.[item].disease_stage.[item].label",
        ui_name: "Disease stage",
      },
      clinical_tnm_finding: {
        path: "diseases.[item].clinical_tnm_finding.[item].label",
        ui_name: "TNM finding",
      },
    },
    interpretations: {
      progress_status: {
        path: "interpretations.[item].progress_status",
        ui_name: "Progress Status",
      },
      summary: {
        path: "interpretations.[item].summary",
        ui_name: "Summary",
      },
      diagnosis: {
        path: "interpretations.[item].diagnosis.disease.label",
        ui_name: "Diagnosis Disease",
      },
    },
    measurements: {
      description: {
        path: "measurements.[item].description",
        ui_name: "Description",
      },
      assay: {
        path: "measurements.[item].assay.label",
        ui_name: "Assay",
      },
      procedure: {
        path: "measurements.[item].procedure.code.label",
        ui_name: "Procedure",
      },
    },
    medical_actions: {
      treatment_target: {
        path: "medical_actions.[item].treatment_target.label",
        ui_name: "Treatment Target",
      },
      treatment_intent: {
        path: "medical_actions.[item].treatment_intent.label",
        ui_name: "Treatment Intent",
      },
      response_to_treatment: {
        path: "medical_actions.[item].response_to_treatment.label",
        ui_name: "Response To Treatment",
      },
      adverse_events: {
        path: "medical_actions.[item].adverse_events.[item].label",
        ui_name: "Adverse Events",
      },
      treatment_termination_reason: {
        path: "medical_actions.[item].treatment_termination_reason.label",
        ui_name: "Treatment Termination Reason",
      },
    },
  },
};
