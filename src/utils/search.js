import {simpleDeepCopy} from "./misc";

export const OP_EQUALS = "eq";
export const OP_LESS_THAN = "lt";
export const OP_LESS_THAN_OR_EQUAL = "le";
export const OP_GREATER_THAN = "gt";
export const OP_GREATER_THAN_OR_EQUAL = "ge";
export const OP_CONTAINING = "co";
export const OP_TEXT_INSENSITIVE_CONTAINING = "ico";

export const OPERATION_TEXT = {
    [OP_EQUALS]: "=",
    [OP_LESS_THAN]: "<",
    [OP_LESS_THAN_OR_EQUAL]: "\u2264",
    [OP_GREATER_THAN]: ">",
    [OP_GREATER_THAN_OR_EQUAL]: "\u2265",
    [OP_CONTAINING]: "containing",
    [OP_TEXT_INSENSITIVE_CONTAINING]: "containing"
};

export const DEFAULT_SEARCH_PARAMETERS = {
    operations: [OP_EQUALS, OP_LESS_THAN, OP_LESS_THAN_OR_EQUAL, OP_GREATER_THAN, OP_GREATER_THAN_OR_EQUAL,
        OP_CONTAINING, OP_TEXT_INSENSITIVE_CONTAINING],
    canNegate: true,
    required: false,
    type: "unlimited",
    queryable: "all",
};

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
    const filteredConditions = conditions.filter(c => c.value && c.value.field);
    if (filteredConditions.length === 0) return null;

    return filteredConditions
        .map(({value}) =>
            (exp => value.negated ? ["#not", exp] : exp)(  // Negate expression if needed
                [`#${value.operation}`,
                    ["#resolve", ...value.field.split(".").slice(1)],
                    value.field2 ? ["#resolve", ...value.field2.split(".").slice(1)] : value.searchValue]
            ))
        .reduce((se, v) => ["#and", se, v]);
};

export const extractQueriesFromDataTypeForms = dataTypeForms => Object.fromEntries(dataTypeForms
    .map(d => [d.dataType.id, conditionsToQuery(extractQueryConditionsFromFormValues(d.formValues))])
    .filter(c => c[1] !== null));
