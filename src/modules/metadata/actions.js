import {message} from "antd";

import {endProjectEditing} from "../manager/actions";
import { createNetworkActionTypes, networkAction } from "../../utils/actions";
import {nop, objectWithoutProps} from "../../utils/misc";
import {jsonRequest} from "../../utils/requests";


export const FETCH_PROJECTS = createNetworkActionTypes("FETCH_PROJECTS");

export const CREATE_PROJECT = createNetworkActionTypes("CREATE_PROJECT");
export const DELETE_PROJECT = createNetworkActionTypes("DELETE_PROJECT");
export const SAVE_PROJECT = createNetworkActionTypes("SAVE_PROJECT");

export const FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES = createNetworkActionTypes("FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES");
export const CREATE_PROJECT_JSON_SCHEMA = createNetworkActionTypes("CREATE_PROJECT_JSON_SCHEMA");
export const DELETE_PROJECT_JSON_SCHEMA = createNetworkActionTypes("DELETE_PROJECT_JSON_SCHEMA");

export const ADD_PROJECT_DATASET = createNetworkActionTypes("ADD_PROJECT_DATASET");
export const SAVE_PROJECT_DATASET = createNetworkActionTypes("SAVE_PROJECT_DATASET");
export const DELETE_PROJECT_DATASET = createNetworkActionTypes("DELETE_PROJECT_DATASET");
export const ADD_DATASET_LINKED_FIELD_SET = createNetworkActionTypes("ADD_DATASET_LINKED_FIELD_SET");
export const SAVE_DATASET_LINKED_FIELD_SET = createNetworkActionTypes("SAVE_DATASET_LINKED_FIELD_SET");
export const DELETE_DATASET_LINKED_FIELD_SET = createNetworkActionTypes("DELETE_DATASET_LINKED_FIELD_SET");

export const FETCH_INDIVIDUAL = createNetworkActionTypes("FETCH_INDIVIDUAL");
export const FETCH_OVERVIEW_SUMMARY = createNetworkActionTypes("FETCH_OVERVIEW_SUMMARY");

export const DELETE_DATASET_DATA_TYPE = createNetworkActionTypes("DELETE_DATASET_DATA_TYPE");

export const clearDatasetDataType = networkAction((datasetId, dataType) => (dispatch, getState) => {
    // TODO: more robust mapping from dataType to url.
    const serviceUrl = dataType === "variant"
        ? getState().services.itemsByKind.gohan.url
        : getState().services.itemsByKind.metadata.url;
    return {
        types: DELETE_DATASET_DATA_TYPE,
        url: `${serviceUrl}/datasets/${datasetId}/data-types/${dataType.identifier}`,
        req: {
            method: "DELETE",
        },
        onError: (error) => {
            // Needs to re throw for project/dataset deletion error handling
            throw error;
        },
    };
});

export const fetchProjects = networkAction(() => (dispatch, getState) => ({
    types: FETCH_PROJECTS,
    url: `${getState().services.metadataService.url}/api/projects`,
    paginated: true,
    err: "Error fetching projects",
}));


// TODO: if needed fetching + invalidation
export const fetchProjectsWithDatasets = () => async (dispatch, getState) => {
    const state = getState();
    if (state.projects.isFetching ||
        state.projects.isCreating ||
        state.projects.isDeleting ||
        state.projects.isSaving) return;

    await dispatch(fetchProjects());
};


const createProject = networkAction((project, history) => (dispatch, getState) => ({
    types: CREATE_PROJECT,
    url: `${getState().services.metadataService.url}/api/projects`,
    req: jsonRequest(project, "POST"),
    err: "Error creating project",
    onSuccess: data => {
        if (history) history.push(`/admin/data/manager/projects/${data.identifier}`);
        message.success(`Project '${data.title}' created!`);
    },
}));


export const createProjectIfPossible = (project, history) => (dispatch, getState) => {
    // TODO: Need object response from POST (is this done??)
    if (getState().projects.isCreating) return;
    return dispatch(createProject(project, history));
};


export const fetchExtraPropertiesSchemaTypes = networkAction(() => (dispatch, getState) => ({
    types: FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES,
    url: `${getState().services.metadataService.url}/api/extra_properties_schema_types`,
    error: "Error fetching extra properties schema types",
}));


const createProjectJsonSchema = networkAction(projectJsonSchema => (dispatch, getState) => ({
    types: CREATE_PROJECT_JSON_SCHEMA,
    url: `${getState().services.metadataService.url}/api/project_json_schemas`,
    req: jsonRequest(projectJsonSchema, "POST"),
    err: "Error creating project JSON schema",
    onSuccess: () => {
        message.success(`Project JSON schema for ${projectJsonSchema.schema_type} created!`);
    },
}));

export const createProjectJsonSchemaIfPossible = (projectJsonSchema) => (dispatch, getState) => {
    if (getState().projects.isCreatingJsonSchema) return;
    return dispatch(createProjectJsonSchema(projectJsonSchema));
};

export const deleteProjectJsonSchema = networkAction(projectJsonSchema => (dispatch, getState) => ({
    types: DELETE_PROJECT_JSON_SCHEMA,
    params: {projectJsonSchema},
    url: `${getState().services.metadataService.url}/api/project_json_schemas/${projectJsonSchema.id}`,
    req: jsonRequest(projectJsonSchema, "DELETE"),
    err: "Error while deleting project JSON schema",
    onSuccess: () => {
        message.success(`Project JSON schema for ${projectJsonSchema.schema_type} was deleted!`);
    },
}));


export const deleteProject = networkAction(project => (dispatch, getState) => ({
    types: DELETE_PROJECT,
    params: {project},
    url: `${getState().services.metadataService.url}/api/projects/${project.identifier}`,
    req: {method: "DELETE"},
    err: `Error deleting project '${project.title}'`,  // TODO: More user-friendly, detailed error
    onSuccess: () => message.success(`Project '${project.title}' deleted!`),
}));

export const deleteProjectIfPossible = project => async (dispatch, getState) => {
    if (getState().projects.isDeleting) return;

    // Remove data without destroying project/datasets first
    try {
        await Promise.all(project.datasets.map(ds => dispatch(clearDatasetDataTypes(ds.identifier))));
        await dispatch(deleteProject(project));
    } catch (err) {
        console.error(err);
        message.error(`Error deleting project '${project.title}'`);
    }
};

export const clearDatasetDataTypes = datasetId => async (dispatch, getState) => {
    // only clear data types which can yield counts - `queryable` is a proxy for this
    const dataTypes = Object.values(getState().datasetDataTypes.itemsById[datasetId].itemsById)
        .filter(dtDetails => dtDetails.queryable);
    return await Promise.all(dataTypes.map(dt => dispatch(clearDatasetDataType(datasetId, dt))));
};

const saveProject = networkAction(project => (dispatch, getState) => ({
    types: SAVE_PROJECT,
    url: `${getState().services.metadataService.url}/api/projects/${project.identifier}`,
    req: jsonRequest(project, "PUT"),
    err: `Error saving project '${project.title}'`,  // TODO: More user-friendly error
    onSuccess: () => {
        dispatch(endProjectEditing());
        message.success(`Project '${project.title}' saved!`);
    },
}));

export const saveProjectIfPossible = project => (dispatch, getState) => {
    if (getState().projects.isDeleting || getState().projects.isSaving) return;
    return dispatch(saveProject(project));
};


export const addProjectDataset = networkAction((project, dataset, onSuccess = nop) => (dispatch, getState) => ({
    types: ADD_PROJECT_DATASET,
    url: `${getState().services.metadataService.url}/api/datasets`,
    req: jsonRequest({...dataset, project: project.identifier}, "POST"),
    err: `Error adding dataset to project '${project.title}'`,  // TODO: More user-friendly error
    // TODO: END ACTION?
    onSuccess: async () => {
        await onSuccess();
        message.success(`Added dataset '${dataset.title}' to project ${project.title}!`);
    },
}));

export const saveProjectDataset = networkAction((dataset, onSuccess = nop) => (dispatch, getState) => ({
    types: SAVE_PROJECT_DATASET,
    url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
    // Filter out read-only props
    // TODO: PATCH
    req: jsonRequest(objectWithoutProps(dataset, ["identifier", "created", "updated"]), "PUT"),
    err: `Error saving dataset '${dataset.title}'`,
    onSuccess: async () => {
        await onSuccess();
        message.success(`Saved dataset '${dataset.title}'`);
    },
}));

export const deleteProjectDataset = networkAction((project, dataset) => (dispatch, getState) => ({
    types: DELETE_PROJECT_DATASET,
    params: {project, dataset},
    url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
    req: {method: "DELETE"},
    err: `Error deleting dataset '${dataset.title}'`,
}));

export const deleteProjectDatasetIfPossible = (project, dataset) => async (dispatch, getState) => {
    if (getState().projects.isAddingDataset
        || getState().projects.isSavingDataset
        || getState().projects.isDeletingDataset) return;
    try {
        await dispatch(clearDatasetDataTypes(dataset.identifier));
        await dispatch(deleteProjectDataset(project, dataset));
    } catch (err) {
        console.error(err);
        message.error(`Error deleting dataset '${dataset.title}'`);
    }
};


const addDatasetLinkedFieldSet = networkAction((dataset, linkedFieldSet, onSuccess) => (dispatch, getState) => ({
    types: ADD_DATASET_LINKED_FIELD_SET,
    url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
    req: jsonRequest({linked_field_sets: [...dataset.linked_field_sets, linkedFieldSet]}, "PATCH"),
    err: `Error adding linked field set '${linkedFieldSet.name}' to dataset '${dataset.title}'`,
    onSuccess: async () => {
        await onSuccess();
        message.success(`Added linked field set '${linkedFieldSet.name}' to dataset '${dataset.title}'`);
    },
}));

export const addDatasetLinkedFieldSetIfPossible = (dataset, linkedFieldSet, onSuccess = nop) =>
    (dispatch, getState) => {
        if (getState().projects.isAddingDataset
            || getState().projects.isSavingDataset
            || getState().projects.isDeletingDataset) return;
        return dispatch(addDatasetLinkedFieldSet(dataset, linkedFieldSet, onSuccess));
    };


const saveDatasetLinkedFieldSet = networkAction((dataset, index, linkedFieldSet, onSuccess) =>
    (dispatch, getState) => ({
        types: SAVE_DATASET_LINKED_FIELD_SET,
        url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
        req: jsonRequest({
            linked_field_sets: dataset.linked_field_sets.map((l, i) => i === index ? linkedFieldSet : l),
        }, "PATCH"),
        err: `Error saving linked field set '${linkedFieldSet.name}' in dataset '${dataset.title}'`,
        onSuccess: async () => {
            await onSuccess();
            message.success(`Saved linked field set '${linkedFieldSet.name}' in dataset '${dataset.title}'`);
        },
    }));

export const saveDatasetLinkedFieldSetIfPossible = (dataset, index, linkedFieldSet, onSuccess = nop) =>
    (dispatch, getState) => {
        if (getState().projects.isAddingDataset
            || getState().projects.isSavingDataset
            || getState().projects.isDeletingDataset) return;
        return dispatch(saveDatasetLinkedFieldSet(dataset, index, linkedFieldSet, onSuccess));
    };


const deleteDatasetLinkedFieldSet = networkAction((dataset, linkedFieldSet, linkedFieldSetIndex) =>
    (dispatch, getState) => ({
        types: DELETE_DATASET_LINKED_FIELD_SET,
        url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
        req: jsonRequest({
            linked_field_sets: dataset.linked_field_sets.filter((_, i) => i !== linkedFieldSetIndex),
        }, "PATCH"),
        err: `Error deleting linked field set '${linkedFieldSet.name}' from dataset '${dataset.title}'`,
        onSuccess: () =>
            message.success(`Deleted linked field set '${linkedFieldSet.name}' from dataset '${dataset.title}'`),
    }));

export const deleteDatasetLinkedFieldSetIfPossible = (dataset, linkedFieldSet, linkedFieldSetIndex) =>
    (dispatch, getState) => {
        if (getState().projects.isAddingDataset
            || getState().projects.isSavingDataset
            || getState().projects.isDeletingDataset) return;
        return dispatch(deleteDatasetLinkedFieldSet(dataset, linkedFieldSet, linkedFieldSetIndex));
    };


const fetchIndividual = networkAction(individualID => (dispatch, getState) => ({
    types: FETCH_INDIVIDUAL,
    params: {individualID},
    url: `${getState().services.metadataService.url}/api/individuals/${individualID}`,
    err: `Error fetching individual ${individualID}`,
}));

export const fetchIndividualIfNecessary = individualID => (dispatch, getState) => {
    const individualRecord = getState().individuals.itemsByID[individualID] || {};
    if (individualRecord.isFetching || individualRecord.data) return;  // Don't fetch if already fetching or loaded.
    return dispatch(fetchIndividual(individualID));
};


export const fetchOverviewSummary = networkAction(() => (dispatch, getState) => ({
    types: FETCH_OVERVIEW_SUMMARY,
    url: `${getState().services.metadataService.url}/api/overview`,
    err: "Error fetching overview summary metadata",
}));

