import PropTypes from "prop-types";

const DUO_PCC_GENERAL_RESEARCH_USE = "GRU";
const DUO_PCC_GENERAL_RESEARCH_USE_AND_CLINICAL_CARE = "GRU-CC";
const DUO_PCC_HEALTH_MEDICAL_BIOMEDICAL_RESEARCH = "HMB";
const DUO_PCC_DISEASE_SPECIFIC_RESEARCH = "DS";
const DUO_PCC_POPULATION_ORIGINS_OR_ANCESTRY_RESEARCH = "POA";
const DUO_PCC_NO_RESTRICTION = "NRES";

const DUO_SCC_GENETIC_STUDIES_ONLY = "GSO";
const DUO_SCC_NO_GENERAL_METHODS_RESEARCH = "NGMR";
const DUO_SCC_RESEARCH_SPECIFIC_RESTRICTIONS = "RS";
const DUO_SCC_RESEARCH_USE_ONLY = "RU";

const DUO_COLLABORATION_REQUIRED = "COL";
const DUO_ETHICS_APPROVAL_REQUIRED = "IRB";
const DUO_GEOGRAPHICAL_RESTRICTION = "GS";
const DUO_INSTITUTION_SPECIFIC_RESTRICTION = "IS";
export const DUO_NOT_FOR_PROFIT_USE_ONLY = "NPU";
const DUO_PROJECT_SPECIFIC_RESTRICTION = "PS";
const DUO_PUBLICATION_MORATORIUM = "MOR";
const DUO_PUBLICATION_REQUIRED = "PUB";
const DUO_RETURN_TO_DATABASE_OR_RESOURCE = "RTN";
const DUO_TIME_LIMIT_ON_USE = "TS";
const DUO_USER_SPECIFIC_RESTRICTION = "US";


export const PRIMARY_CONSENT_CODE_KEYS = [
    DUO_PCC_GENERAL_RESEARCH_USE,
    DUO_PCC_GENERAL_RESEARCH_USE_AND_CLINICAL_CARE,
    DUO_PCC_HEALTH_MEDICAL_BIOMEDICAL_RESEARCH,
    DUO_PCC_DISEASE_SPECIFIC_RESEARCH,
    DUO_PCC_POPULATION_ORIGINS_OR_ANCESTRY_RESEARCH,
    DUO_PCC_NO_RESTRICTION,
];

export const PRIMARY_CONSENT_CODE_INFO = {
    [DUO_PCC_GENERAL_RESEARCH_USE]: {
        title: "General Research Use",
        content: "This primary category consent code indicates that use is allowed for general research use for any " +
            "research purpose. This includes but is not limited to: health/medical/biomedical purposes, fundamental " +
            "biology research, the study of population origins or ancestry, statistical methods and algorithms " +
            "development, and social-sciences research.",
    },
    [DUO_PCC_GENERAL_RESEARCH_USE_AND_CLINICAL_CARE]: {
        title: "General Research Use + Clinical Care",
        content: "This primary category consent code indicates that use is allowed for health/medical/biomedical " +
            "purposes and other biological research, including the study of population origins or ancestry.",
    },
    [DUO_PCC_HEALTH_MEDICAL_BIOMEDICAL_RESEARCH]: {
        title: "Health/Medical/Biomedical Research",
        content: "This primary category consent code indicates that use is allowed for health/medical/biomedical " +
            "purposes; does not include the study of population origins or ancestry.",
    },
    [DUO_PCC_DISEASE_SPECIFIC_RESEARCH]: {
        title: "Disease-Specific Research",
        content: "This primary category consent code indicates that use is allowed provided it is related to the " +
            "specified disease.",
    },
    [DUO_PCC_POPULATION_ORIGINS_OR_ANCESTRY_RESEARCH]: {
        title: "Population Origins or Ancestry Research",
        content: " primary category consent code indicates that use of the data is limited to the study of " +
            "population origins or ancestry.",
    },
    [DUO_PCC_NO_RESTRICTION]: {
        title: "No Restriction",
        content: "This consent code primary category indicates there is no restriction on use.",
    },
};


export const SECONDARY_CONSENT_CODE_KEYS = [
    DUO_SCC_GENETIC_STUDIES_ONLY,
    DUO_SCC_NO_GENERAL_METHODS_RESEARCH,
    DUO_SCC_RESEARCH_SPECIFIC_RESTRICTIONS,
    DUO_SCC_RESEARCH_USE_ONLY,
];

export const SECONDARY_CONSENT_CODE_INFO = {
    [DUO_SCC_GENETIC_STUDIES_ONLY]: {
        title: "Genetic Studies Only",
        content: "This secondary category consent code indicates that use is limited to genetic studies only " +
            "(i.e., no phenotype-only research)",
    },
    [DUO_SCC_NO_GENERAL_METHODS_RESEARCH]: {
        title: "No General Methods Research",
        content: "This secondary category consent code indicates that use includes methods development research " +
            "(e.g., development of software or algorithms) only within the bounds of other use limitations.",
    },
    [DUO_SCC_RESEARCH_SPECIFIC_RESTRICTIONS]: {
        title: "Research-Specific Restrictions",
        content: "This secondary category consent code indicates that use is limited to studies of a certain " +
            "research type.",
    },
    [DUO_SCC_RESEARCH_USE_ONLY]: {
        title: "Research Use Only",
        content: "This secondary category consent code indicates that use is limited to research purposes " +
            "(e.g., does not include its use in clinical care).",
    },
};


export const DATA_USE_KEYS = [
    DUO_COLLABORATION_REQUIRED,
    DUO_ETHICS_APPROVAL_REQUIRED,
    DUO_GEOGRAPHICAL_RESTRICTION,
    DUO_INSTITUTION_SPECIFIC_RESTRICTION,
    DUO_NOT_FOR_PROFIT_USE_ONLY,
    DUO_PROJECT_SPECIFIC_RESTRICTION,
    DUO_PUBLICATION_MORATORIUM,
    DUO_PUBLICATION_REQUIRED,
    DUO_RETURN_TO_DATABASE_OR_RESOURCE,
    DUO_TIME_LIMIT_ON_USE,
    DUO_USER_SPECIFIC_RESTRICTION,
];

export const DATA_USE_INFO = {
    [DUO_COLLABORATION_REQUIRED]: {
        icon: "team",
        title: "Collaboration Required",
        content: "This requirement indicates that the requester must agree to collaboration with the primary " +
            "study investigator(s).",
    },
    [DUO_ETHICS_APPROVAL_REQUIRED]: {
        icon: "reconciliation",
        title: "Ethics Approval Required",
        content: "This requirement indicates that the requester must provide documentation of local IRB/ERB approval.",
    },
    [DUO_GEOGRAPHICAL_RESTRICTION]: {
        icon: "global",
        title: "Geographical Restriction",
        content: "This requirement indicates that use is limited to within a specific geographic region.",
    },
    [DUO_INSTITUTION_SPECIFIC_RESTRICTION]: {
        icon: "bank",
        title: "Institution-Specific Restriction",
        content: "This requirement indicates that use is limited to use within an approved institution.",
    },
    [DUO_NOT_FOR_PROFIT_USE_ONLY]: {
        icon: "dollar", // Gets modified below
        title: "Not-For-Profit Use Only",
        content: "This requirement indicates that use of the data is limited to not-for-profit organizations " +
            "and not-for-profit use, non-commercial use.",
    },
    [DUO_PROJECT_SPECIFIC_RESTRICTION]: {
        icon: "audit",
        title: "Project-Specific Restriction",
        content: "This requirement indicates that use is limited to use within an approved project.",
    },
    [DUO_PUBLICATION_MORATORIUM]: {
        icon: "exception",
        title: "Publication Moratorium",
        content: "This requirement indicates that requester agrees not to publish results of studies until a " +
            "specific date",
    },
    [DUO_PUBLICATION_REQUIRED]: {
        icon: "file-done",
        title: "Publication Required",
        content: "This requirement indicates that requester agrees to make results of studies using the data " +
            "available to the larger scientific community.",
    },
    [DUO_RETURN_TO_DATABASE_OR_RESOURCE]: {
        icon: "database",
        title: "Return to Database or Resource",
        content: "This requirement indicates that the requester must return derived/enriched data to the " +
            "database/resource.",
    },
    [DUO_TIME_LIMIT_ON_USE]: {
        icon: "clock-circle",
        title: "Time Limit on Use",
        content: "This requirement indicates that use is approved for a specific number of months.",
    },
    [DUO_USER_SPECIFIC_RESTRICTION]: {
        icon: "user",
        title: "User-Specific Restriction",
        content: "This requirement indicates that use is limited to use by approved users.",
    },
};


const DATA_USE_CODE_ITEM_SHAPE = PropTypes.shape({
    code: PropTypes.string,
    data: PropTypes.object,  // TODO
});

export const DATA_USE_PROP_TYPE_SHAPE = PropTypes.shape({
    consent_code: PropTypes.shape({
        primary_category: DATA_USE_CODE_ITEM_SHAPE,
        secondary_categories: PropTypes.arrayOf(DATA_USE_CODE_ITEM_SHAPE),
    }),
    data_use_requirements: PropTypes.arrayOf(DATA_USE_CODE_ITEM_SHAPE),
});


export const INITIAL_DATA_USE_VALUE = {
    consent_code: {
        primary_category: null,
        secondary_categories: [],
    },
    data_use_requirements: [],
};
