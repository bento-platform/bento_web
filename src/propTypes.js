import PropTypes from "prop-types";
import {FORM_MODE_ADD, FORM_MODE_EDIT} from "./constants";
import {KARYOTYPIC_SEX_VALUES, SEX_VALUES} from "./dataTypes/phenopacket";

export const propTypesFormMode = PropTypes.oneOf([FORM_MODE_ADD, FORM_MODE_EDIT]);

export const serviceInfoPropTypesShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.shape({
        group: PropTypes.string.isRequired,
        artifact: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,
    }).isRequired,
    description: PropTypes.string,
    organization: PropTypes.shape({
        name: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
    }),
    contactUrl: PropTypes.string,
    documentationUrl: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    environment: PropTypes.string,
    version: PropTypes.string.isRequired,
    git_tag: PropTypes.string,
    git_branch: PropTypes.string,
    bento: PropTypes.shape({
        serviceKind: PropTypes.string,
        dataService: PropTypes.bool,
        gitTag: PropTypes.string,
        gitBranch: PropTypes.string,
        gitCommit: PropTypes.string,
    }),
});

export const bentoServicePropTypesMixin = {
    service_kind: PropTypes.string,
    artifact: PropTypes.string,
    repository: PropTypes.string,
    disabled: PropTypes.bool,
    url_template: PropTypes.string,
    url: PropTypes.string,
};

// Gives components which include this in their state to props connection access to the drop box and loading status.
export const dropBoxTreeStateToPropsMixin = state => ({
    tree: state.dropBox.tree,
    treeLoading: state.dropBox.isFetching,
});

// Any components which include dropBoxTreeStateToPropsMixin should include this as well in their prop types.
export const dropBoxTreeStateToPropsMixinPropTypes = {
    tree: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        filePath: PropTypes.string.isRequired,
        relativePath: PropTypes.string.isRequired,
        uri: PropTypes.string,
        lastModified: PropTypes.number,
        lastMetadataChange: PropTypes.number,
        contents: PropTypes.arrayOf(PropTypes.object),
    })),  // TODO: This is going to change
    treeLoading: PropTypes.bool,
};

export const linkedFieldSetPropTypesShape = PropTypes.shape({
    name: PropTypes.string,
    fields: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),  // TODO: Properties pattern?
});

// Prop types object shape for a single dataset object.
export const datasetPropTypesShape = PropTypes.shape({
    identifier: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    contact_info: PropTypes.string,
    data_use: PropTypes.object,  // TODO: Shape
    linked_field_sets: PropTypes.arrayOf(linkedFieldSetPropTypesShape),
    created: PropTypes.string,
    updated: PropTypes.string,

    // May not be present if nested (project ID)
    project: PropTypes.string,
});

export const projectJsonSchemaTypesShape = PropTypes.shape({
    id: PropTypes.string,
    schema_type: PropTypes.string,
    project: PropTypes.string,
    required: PropTypes.bool,
    json_schema: PropTypes.object, // TODO: Shape
});

// Prop types object shape for a single project object.
export const projectPropTypesShape = PropTypes.shape({
    identifier: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    datasets: PropTypes.arrayOf(datasetPropTypesShape),
    project_schemas: PropTypes.arrayOf(projectJsonSchemaTypesShape),
    created: PropTypes.string,
    updated: PropTypes.string,
});

// Prop types object shape for a single notification object.
export const notificationPropTypesShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    notification_type: PropTypes.string,
    action_target: PropTypes.string,
    read: PropTypes.bool,
    timestamp: PropTypes.string,  // TODO: de-serialize?
});

// Prop types object shape for a run object.
// TODO: Missing stuff
export const runPropTypesShape = PropTypes.shape({
    run_id: PropTypes.string,
    state: PropTypes.string,

    // withDetails=true
    details: PropTypes.shape({
        run_id: PropTypes.string,
        state: PropTypes.string,
        request: PropTypes.shape({
            workflow_params: PropTypes.object,
            workflow_type: PropTypes.string,
            workflow_type_version: PropTypes.string,
            workflow_engine_parameters: PropTypes.object,
            workflow_url: PropTypes.string,
            tags: PropTypes.object,
        }),
        run_log: PropTypes.shape({
            name: PropTypes.string,
            cmd: PropTypes.string,
            start_time: PropTypes.string,  // TODO: De-serialize?
            end_time: PropTypes.string,  // TODO: De-serialize?
            stdout: PropTypes.string,
            stderr: PropTypes.string,
            exit_code: PropTypes.number,
        }),
    }),
});

// Prop types object shape for a single table summary object.
export const summaryPropTypesShape = PropTypes.object;

// Prop types object shape describing the target of a workflow (project, dataset and data-type)
export const workflowTarget = PropTypes.shape({
    selectedProject: PropTypes.string,
    selectedDataset: PropTypes.string,
    selectedDataType: PropTypes.string,
});

// Gives components which include this in their state to props connection access to workflows and loading status.
export const workflowsStateToPropsMixin = state => {
    const workflowsByType = {
        ingestion: [],
        analysis: [],
        export: [],
    };

    Object.entries(state.serviceWorkflows.workflowsByServiceID)
        .filter(([_, s]) => !s.isFetching)
        .forEach(([serviceID, s]) => {
            Object.entries(s.workflows).forEach(([workflowType, workflowTypeWorkflows]) => {
                if (!(workflowType in workflowsByType)) return;

                // noinspection JSCheckFunctionSignatures
                workflowsByType[workflowType].push(
                    ...Object.entries(workflowTypeWorkflows).map(([k, v]) => ({
                        ...v,
                        id: k,
                        serviceID,
                    })),
                );
            });
        });

    return {
        workflows: workflowsByType,
        workflowsLoading: state.services.isFetchingAll || state.serviceWorkflows.isFetchingAll,
    };
};

// Prop types object shape for a single workflow object.
export const workflowPropTypesShape = PropTypes.shape({
    id: PropTypes.string,
    serviceID: PropTypes.string,

    // "Real" properties
    name: PropTypes.string,
    description: PropTypes.string,
    data_type: PropTypes.string,
    inputs: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.string,
        extensions: PropTypes.arrayOf(PropTypes.string),  // File type only
    })),
    outputs: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        value: PropTypes.string,
    })),
});

// Any components which include workflowStateToPropsMixin should include this as well in their prop types.
export const workflowsStateToPropsMixinPropTypes = {
    workflows: PropTypes.shape({
        ingestion: PropTypes.arrayOf(workflowPropTypesShape),
        analysis: PropTypes.arrayOf(workflowPropTypesShape),
        export: PropTypes.arrayOf(workflowPropTypesShape),
    }),
    workflowsLoading: PropTypes.bool,
};

// Shape of a phenopackets ontology object
export const ontologyShape = PropTypes.shape({
    id: PropTypes.string,  // CURIE ID
    label: PropTypes.string,  // Term label
});

const agePropTypesShape = PropTypes.shape({
    age: PropTypes.string,  // ISO duration string
});

const ageRangePropTypesShape = PropTypes.shape({
    start: agePropTypesShape,
    end: agePropTypesShape,
});

// Prop types object shape for a single biosample object from the metadata service.
export const biosamplePropTypesShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    procedure: PropTypes.shape({
        code: ontologyShape.isRequired,
        body_site: ontologyShape,
        created: PropTypes.string,  // ISO datetime string
        updated: PropTypes.string,  // ISO datetime string
    }).isRequired,
    description: PropTypes.string,
    sampled_tissue: ontologyShape.isRequired,
    individual_age_at_collection: PropTypes.oneOfType([agePropTypesShape, ageRangePropTypesShape]),
    histological_diagnosis: ontologyShape,
    tumor_progression: ontologyShape,
    tumor_grade: ontologyShape,
    diagnostic_markers: PropTypes.arrayOf(ontologyShape),
    created: PropTypes.string,  // ISO datetime string
    updated: PropTypes.string,  // ISO datetime string
});

// Prop types object shape for a single patient individual object from the metadata service.
export const individualPropTypesShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    alternate_ids: PropTypes.arrayOf(PropTypes.string),

    date_of_birth: PropTypes.string,
    age: PropTypes.object,  // TODO: Shape
    sex: PropTypes.oneOf(SEX_VALUES),
    karyotypic_sex: PropTypes.oneOf(KARYOTYPIC_SEX_VALUES),
    ethnicity: PropTypes.string,
    taxonomy: ontologyShape,

    phenopackets: PropTypes.arrayOf(PropTypes.object),  // TODO
    biosamples: PropTypes.arrayOf(biosamplePropTypesShape),

    created: PropTypes.string,  // ISO datetime string
    updated: PropTypes.string,  // ISO datetime string
});

// Prop types object shape for a single phenopacket disease object.
export const diseasePropTypesShape = PropTypes.shape({
    id: PropTypes.number.isRequired,
    term: ontologyShape.isRequired,
    onset: PropTypes.object,  // TODO
    disease_stage: PropTypes.arrayOf(ontologyShape),
    tnm_finding: PropTypes.arrayOf(ontologyShape),
    created: PropTypes.string,  // ISO datetime string
    updated: PropTypes.string,  // ISO datetime string
});

// Prop types object shape for a single phenopacket phenotypic feature object.
export const phenotypicFeaturePropTypesShape = PropTypes.shape({
    type: ontologyShape.isRequired,
    created: PropTypes.string,  // ISO datetime string
    updated: PropTypes.string,  // ISO datetime string
});

export const phenopacketPropTypesShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    subject: PropTypes.oneOfType([individualPropTypesShape, PropTypes.string]).isRequired,
    biosamples: biosamplePropTypesShape.isRequired,
    diseases: diseasePropTypesShape.isRequired,
    phenotypic_features: phenotypicFeaturePropTypesShape,
    meta_data: PropTypes.object.isRequired,  // TODO: Shape
    created: PropTypes.string,  // ISO datetime string
    updated: PropTypes.string,  // ISO datetime string
});

export const experimentPropTypesShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    study_type: PropTypes.string,

    experiment_type: PropTypes.string.isRequired,
    experiment_ontology: PropTypes.arrayOf(PropTypes.object),  // TODO: Array of ontology terms

    molecule: PropTypes.string,
    molecule_ontology: PropTypes.arrayOf(PropTypes.object),  // TODO: Array of ontology terms

    library_strategy: PropTypes.string,
    library_source: PropTypes.string,
    library_selection: PropTypes.string,
    library_layout: PropTypes.string,

    extraction_protocol: PropTypes.string,
    reference_registry_id: PropTypes.string,

    biosample: PropTypes.string,  // Biosample foreign key
    instrument: PropTypes.shape({
        identifier: PropTypes.string,
        platform: PropTypes.string,
        description: PropTypes.string,
        model: PropTypes.string,
    }),

    experiment_results: PropTypes.arrayOf(PropTypes.shape({
        identifier: PropTypes.string,
        description: PropTypes.string,
        filename: PropTypes.string,
        file_format: PropTypes.oneOf([
            "SAM",
            "BAM",
            "CRAM",
            "BAI",
            "CRAI",
            "VCF",
            "BCF",
            "GVCF",
            "BigWig",
            "BigBed",
            "FASTA",
            "FASTQ",
            "TAB",
            "SRA",
            "SRF",
            "SFF",
            "GFF",
            "TABIX",
            "UNKNOWN",
            "OTHER",
        ]),
        data_output_type: PropTypes.oneOf(["Raw data", "Derived data"]),
        usage: PropTypes.string,
    })),

    qc_flags: PropTypes.arrayOf(PropTypes.string),

    created: PropTypes.string,  // ISO datetime string
    updated: PropTypes.string,  // ISO datetime string
});

export const overviewSummaryPropTypesShape = PropTypes.shape({
    data: PropTypes.shape({
        // TODO: more precision
        phenopackets: PropTypes.number,
        data_type_specific: PropTypes.shape({
            biosamples: PropTypes.object,
            diseases: PropTypes.object,
            individuals: PropTypes.object,
            phenotypic_features: PropTypes.object,
        }),
    }),
});

export const searchAllRecordsPropTypesShape = PropTypes.shape({
    data: PropTypes.shape({
        // TODO: more precision
        phenopackets: PropTypes.number,
        data_type_specific: PropTypes.shape({
            biosamples: PropTypes.object,
            diseases: PropTypes.object,
            individuals: PropTypes.object,
            phenotypic_features: PropTypes.object,
        }),
    }),
});



// Explorer search results format
export const explorerSearchResultsPropTypesShape = PropTypes.shape({
    results: PropTypes.shape({
        // TODO: Other data types
        experiment: PropTypes.arrayOf(experimentPropTypesShape),
        phenopacket: PropTypes.arrayOf(phenopacketPropTypesShape),
        variant: PropTypes.arrayOf(PropTypes.object),  // TODO: Variant prop types shape
    }),
    searchFormattedResults: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        individual: PropTypes.shape({
            id: PropTypes.string.isRequired,
            alternate_ids: PropTypes.arrayOf(PropTypes.string),
        }),
        biosamples: PropTypes.arrayOf(PropTypes.string),
        experiments: PropTypes.number,
    })),
});
