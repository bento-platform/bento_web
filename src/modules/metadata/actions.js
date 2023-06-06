import fetch from "cross-fetch";
import {message} from "antd";

import {
    ADDING_SERVICE_TABLE,
    DELETING_SERVICE_TABLE,
    endAddingServiceTable,
    endDeletingServiceTable,
} from "../services/actions";
import {endProjectEditing} from "../manager/actions";

import {
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,

    beginFlow,
    endFlow,
    terminateFlow,
} from "../../utils/actions";
import {nop, objectWithoutProps} from "../../utils/misc";
import {jsonRequest} from "../../utils/requests";
import {makeAuthorizationHeader} from "../../lib/auth/utils";


export const FETCH_PROJECTS = createNetworkActionTypes("FETCH_PROJECTS");
export const FETCH_PROJECT_TABLES = createNetworkActionTypes("FETCH_PROJECT_TABLES");
export const FETCHING_PROJECTS_WITH_TABLES = createFlowActionTypes("FETCHING_PROJECTS_WITH_TABLES");

export const CREATE_PROJECT = createNetworkActionTypes("CREATE_PROJECT");
export const DELETE_PROJECT = createNetworkActionTypes("DELETE_PROJECT");
export const SAVE_PROJECT = createNetworkActionTypes("SAVE_PROJECT");

export const CREATE_PROJECT_JSON_SCHEMA = createNetworkActionTypes("CREATE_PROJECT_JSON_SCHEMA");
export const DELETE_PROJECT_JSON_SCHEMA = createNetworkActionTypes("DELETE_PROJECT_JSON_SCHEMA");

export const ADD_PROJECT_DATASET = createNetworkActionTypes("ADD_PROJECT_DATASET");
export const SAVE_PROJECT_DATASET = createNetworkActionTypes("SAVE_PROJECT_DATASET");
export const DELETE_PROJECT_DATASET = createNetworkActionTypes("DELETE_PROJECT_DATASET");
export const ADD_DATASET_LINKED_FIELD_SET = createNetworkActionTypes("ADD_DATASET_LINKED_FIELD_SET");
export const SAVE_DATASET_LINKED_FIELD_SET = createNetworkActionTypes("SAVE_DATASET_LINKED_FIELD_SET");
export const DELETE_DATASET_LINKED_FIELD_SET = createNetworkActionTypes("DELETE_DATASET_LINKED_FIELD_SET");

export const PROJECT_TABLE_ADDITION = createFlowActionTypes("PROJECT_TABLE_ADDITION");
export const PROJECT_TABLE_DELETION = createFlowActionTypes("PROJECT_TABLE_DELETION");

export const FETCH_INDIVIDUAL = createNetworkActionTypes("FETCH_INDIVIDUAL");
export const FETCH_OVERVIEW_SUMMARY = createNetworkActionTypes("FETCH_OVERVIEW_SUMMARY");


const endProjectTableAddition = (project, table) => ({type: PROJECT_TABLE_ADDITION.END, project, table});
const endProjectTableDeletion = (project, tableID) => ({type: PROJECT_TABLE_DELETION.END, project, tableID});


export const fetchProjects = networkAction(() => (dispatch, getState) => ({
    types: FETCH_PROJECTS,
    url: `${getState().services.metadataService.url}/api/projects`,
    paginated: true,
    err: "Error fetching projects",
}));


export const fetchProjectTables = networkAction(projectsByID => (dispatch, getState) => ({
    types: FETCH_PROJECT_TABLES,
    params: {projectsByID},
    url: `${getState().services.metadataService.url}/api/table_ownership`,
    paginated: true,
    err: "Error fetching tables",
}));


// TODO: if needed fetching + invalidation
export const fetchProjectsWithDatasetsAndTables = () => async (dispatch, getState) => {
    const state = getState();
    if (state.projects.isFetching ||
        state.projects.isCreating ||
        state.projects.isDeleting ||
        state.projects.isSaving) return;

    dispatch(beginFlow(FETCHING_PROJECTS_WITH_TABLES));
    await dispatch(fetchProjects());
    await dispatch(fetchProjectTables(getState().projects.itemsByID));
    dispatch(endFlow(FETCHING_PROJECTS_WITH_TABLES));
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

export const deleteProjectIfPossible = project => (dispatch, getState) => {
    if (getState().projects.isDeleting) return;
    return dispatch(deleteProject(project));

    // TODO: Do we need to delete project tables as well? What to do here??
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
    // TODO: Do we need to delete project tables as well? What to do here??
}));

export const deleteProjectDatasetIfPossible = (project, dataset) => (dispatch, getState) => {
    if (getState().projects.isAddingDataset
        || getState().projects.isSavingDataset
        || getState().projects.isDeletingDataset) return;
    return dispatch(deleteProjectDataset(project, dataset));
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


// TODO: Split into network actions, use onSuccess
export const addProjectTable = (project, datasetID, serviceInfo, dataType, tableName) =>
    async (dispatch, getState) => {
        if (getState().projectTables.isAdding) return;  // TODO: or isDeleting

        const authHeaders = makeAuthorizationHeader(getState().auth.accessToken);

        dispatch(beginFlow(PROJECT_TABLE_ADDITION));
        dispatch(beginFlow(ADDING_SERVICE_TABLE));

        const terminate = () => {
            message.error(`Error adding new table '${tableName}'`);
            dispatch(terminateFlow(ADDING_SERVICE_TABLE));
            dispatch(terminateFlow(PROJECT_TABLE_ADDITION));
        };

        await fetch(`${serviceInfo.url}/tables?data-type=${dataType}`, {
            method: "OPTIONS",
            headers: authHeaders,
        });

        try {
            const serviceResponse = await fetch(
                `${serviceInfo.url}/tables`,
                jsonRequest({
                    name: tableName.trim(),
                    metadata: {},
                    data_type: dataType,
                    dataset: datasetID,  // This will only be used by the metadata service to create the ownership
                }, "POST", authHeaders));

            if (!serviceResponse.ok) {
                console.error(serviceResponse);
                terminate();
                return;
            }

            const serviceTable = await serviceResponse.json();
            // Backwards compatibility for:
            // - old type ("group:artifact:version")
            // - and new  ({"group": "...", "artifact": "...", "version": "..."})
            const serviceArtifact = (typeof serviceInfo.type === "string")
                ? serviceInfo.type.split(":")[1]
                : serviceInfo.type.artifact;

            try {
                // If table is created in the metadata service, it'll handle automatically creating the ownership record
                const projectResponse = await (
                    serviceArtifact === "metadata" ? fetch(
                        `${getState().services.metadataService.url}/api/table_ownership/${serviceTable.id}`,
                        {method: "GET", headers: authHeaders},
                    ) : fetch(
                        `${getState().services.metadataService.url}/api/table_ownership`,
                        jsonRequest({
                            table_id: serviceTable.id,
                            service_id: serviceInfo.id,
                            service_artifact: serviceArtifact,
                            data_type: dataType,

                            dataset: datasetID,
                            sample: null,  // TODO: Sample ID if wanted  // TODO: Deprecate?
                        }, "POST", authHeaders),
                    )
                );

                if (!projectResponse.ok) {
                    // TODO: Delete previously-created service dataset
                    console.error(projectResponse);
                    terminate();
                    return;
                }

                const projectTable = await projectResponse.json();
                message.success("Table added!");  // TODO: Nicer GUI success message
                dispatch(endAddingServiceTable(serviceInfo, dataType, serviceTable));
                dispatch(endProjectTableAddition(project, projectTable));  // TODO: Check params here
            } catch (e) {
                // TODO: Delete previously-created service dataset
                console.error(e);
                terminate();
            }
        } catch (e) {
            console.error(e);
            terminate();
        }
    };


// TODO: Split into network actions, use onSuccess
const deleteProjectTable = (project, table) => async (dispatch, getState) => {
    dispatch(beginFlow(PROJECT_TABLE_DELETION));
    dispatch(beginFlow(DELETING_SERVICE_TABLE));

    const serviceInfo = getState().services.itemsByID[table.service_id];
    const authHeaders = makeAuthorizationHeader(getState().auth.accessToken);

    const terminate = () => {
        message.error(`Error deleting table '${table.name}'`);
        dispatch(terminateFlow(DELETING_SERVICE_TABLE));
        dispatch(terminateFlow(PROJECT_TABLE_DELETION));
    };

    const handleFailure = e => {
        console.error(e);
        message.error("Error deleting table");
        terminate();
    };

    const deleteReqInit = {
        method: "DELETE",
        headers: authHeaders,
    };

        // Delete from service
    try {
        console.debug(`deleting table ${table.table_id}`);
        const serviceResponse = await fetch(`${serviceInfo.url}/tables/${table.table_id}`, deleteReqInit);
        if (!serviceResponse.ok) return handleFailure(serviceResponse);
    } catch (e) {
        return handleFailure(e);
    }

    // Delete from project metadata
    try {
        if ((serviceInfo.bento?.serviceKind ?? serviceInfo.type.artifact) !== "metadata") {
            // Only manually delete the table ownership record if we're not deleting from Katsu, since Katsu
            // handles its own table ownership deletion.

            const projectResponse = await fetch(
                `${getState().services.metadataService.url}/api/table_ownership/${table.table_id}`,
                deleteReqInit,
            );

            if (!projectResponse.ok) {
                // TODO: Handle partial failure / out-of-sync
                return handleFailure(projectResponse);
            }
        }
    } catch (e) {
        // TODO: Handle partial failure / out-of-sync
        return handleFailure(e);
    }

    // Success

    message.success("Table deleted!");  // TODO: Nicer GUI success message

    dispatch(endDeletingServiceTable(serviceInfo.id, table.table_id));  // TODO: Check params here
    dispatch(endProjectTableDeletion(project, table.table_id));  // TODO: Check params here
};

export const deleteProjectTableIfPossible = (project, table) => (dispatch, getState) => {
    if (getState().projectTables.isDeleting) return;

    const service = getState().services.itemsByID[table.service_id];
    if (!service) {
        throw new Error(`Service not found: ${table.service_id}`);
    }

    const serviceKind = service.bento?.serviceKind ?? service.type.artifact;
    const chordServiceInfo = getState().chordServices.itemsByKind[serviceKind];
    if (!chordServiceInfo.manageable_tables) {
        // If manageable_tables is set and not true, we can't delete the table.
        return;
    }
    return dispatch(deleteProjectTable(project, table));
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

