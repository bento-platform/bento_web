import { message } from "antd";

import { endProjectEditing } from "../manager/actions";
import { basicAction, createNetworkActionTypes, networkAction } from "@/utils/actions";
import { nop, objectWithoutProps } from "@/utils/misc";
import { jsonRequest } from "@/utils/requests";

export const FETCH_PROJECTS = createNetworkActionTypes("FETCH_PROJECTS");
export const INVALIDATE_PROJECTS = "INVALIDATE_PROJECTS";

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
export const FETCH_INDIVIDUAL_PHENOPACKETS = createNetworkActionTypes("FETCH_INDIVIDUAL_PHENOPACKETS");

export const DELETE_DATASET_DATA_TYPE = createNetworkActionTypes("DELETE_DATASET_DATA_TYPE");

export const FETCH_DISCOVERY_SCHEMA = createNetworkActionTypes("FETCH_DISCOVERY_SCHEMA");
export const FETCH_DATS_SCHEMA = createNetworkActionTypes("FETCH_DATS_SCHEMA");

const _fetchDiscoverySchema = networkAction(() => (_dispatch, getState) => ({
  types: FETCH_DISCOVERY_SCHEMA,
  url: `${getState().bentoServices.itemsByKind.metadata.url}/api/schemas/discovery`,
  err: "Error fetching discovery JSON schema",
}));

export const fetchDiscoverySchema = () => (dispatch, getState) => {
  const metadataUrl = getState()?.bentoServices?.itemsByKind?.metadata?.url;
  if (!metadataUrl) return Promise.resolve();
  return dispatch(_fetchDiscoverySchema());
};

export const clearDatasetDataType = networkAction((datasetId, dataTypeID) => (_dispatch, getState) => {
  const { service_base_url: serviceBaseUrl } = getState().serviceDataTypes.itemsByID[dataTypeID];
  // noinspection JSUnusedGlobalSymbols
  return {
    types: DELETE_DATASET_DATA_TYPE,
    url: `${serviceBaseUrl}datasets/${datasetId}/data-types/${dataTypeID}`,
    req: {
      method: "DELETE",
    },
    onError: (error) => {
      // Needs to re throw for project/dataset deletion error handling
      throw error;
    },
  };
});

const fetchProjects = networkAction(() => (_dispatch, getState) => ({
  types: FETCH_PROJECTS,
  url: `${getState().services.metadataService.url}/api/projects`,
  publicEndpoint: false,
  paginated: true,
  err: "Error fetching projects",
  check: (state) => {
    const sp = state.projects;
    return (
      !sp.isFetching &&
      !sp.isCreating &&
      !sp.isDeleting &&
      !sp.isSaving &&
      !(state.projects.items.length && !sp.isInvalid)
    );
  },
}));

export const fetchProjectsWithDatasets = () => (dispatch, getState) => {
  if (!getState().services.itemsByKind.metadata) return Promise.resolve();
  return dispatch(fetchProjects());
};

// "Invalidates" project data currently in the state. This means that data in the state should be re-fetched the next
// time the data is used, i.e., should not be counted as already fetched for the purposes of possibly dispatching a
// fetch action. This is useful for handling known changes to back-end state (e.g., signing in as another user, deleting
// a project) and reloading as needed.
export const invalidateProjects = basicAction(INVALIDATE_PROJECTS);

export const createProjectIfPossible = networkAction((project, navigate) => (_dispatch, getState) => ({
  types: CREATE_PROJECT,
  url: `${getState().services.metadataService.url}/api/projects`,
  req: jsonRequest(project, "POST"),
  err: "Error creating project",
  check: (state) => !state.projects.isCreating,
  onSuccess: (data) => {
    if (navigate) navigate(`/data/manager/projects/${data.identifier}`);
    message.success(`Project '${data.title}' created!`);
  },
}));

const _fetchExtraPropertiesSchemaTypes = networkAction(() => (_dispatch, getState) => ({
  types: FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES,
  url: `${getState().services.metadataService.url}/api/extra_properties_schema_types`,
  error: "Error fetching extra properties schema types",
}));

export const fetchExtraPropertiesSchemaTypes = () => (dispatch, getState) => {
  if (!getState().services.itemsByKind.metadata) return Promise.resolve();
  return dispatch(_fetchExtraPropertiesSchemaTypes());
};

export const createProjectJsonSchema = networkAction((projectJsonSchema) => (_dispatch, getState) => ({
  types: CREATE_PROJECT_JSON_SCHEMA,
  check: (state) => !state.projects.isCreatingJsonSchema,
  url: `${getState().services.metadataService.url}/api/project_json_schemas`,
  req: jsonRequest(projectJsonSchema, "POST"),
  err: "Error creating project JSON schema",
  onSuccess: () => {
    message.success(`Project JSON schema for ${projectJsonSchema.schema_type} created!`);
  },
}));

export const deleteProjectJsonSchema = networkAction((projectJsonSchema) => (_dispatch, getState) => ({
  types: DELETE_PROJECT_JSON_SCHEMA,
  params: { projectJsonSchema },
  url: `${getState().services.metadataService.url}/api/project_json_schemas/${projectJsonSchema.id}`,
  req: jsonRequest(projectJsonSchema, "DELETE"),
  err: "Error while deleting project JSON schema",
  onSuccess: () => {
    message.success(`Project JSON schema for ${projectJsonSchema.schema_type} was deleted!`);
  },
}));

export const deleteProject = networkAction((project) => (_dispatch, getState) => ({
  types: DELETE_PROJECT,
  params: { project },
  url: `${getState().services.metadataService.url}/api/projects/${project.identifier}`,
  req: { method: "DELETE" },
  err: `Error deleting project '${project.title}'`, // TODO: More user-friendly, detailed error
  onSuccess: () => message.success(`Project '${project.title}' deleted!`),
}));

export const deleteProjectIfPossible = (project) => async (dispatch, getState) => {
  if (getState().projects.isDeleting) return;

  // Remove data without destroying project/datasets first
  try {
    await Promise.all(project.datasets.map((ds) => dispatch(clearDatasetDataTypes(ds.identifier))));
    await dispatch(deleteProject(project));
  } catch (err) {
    console.error(err);
    message.error(`Error deleting project '${project.title}'`);
  }
};

export const clearDatasetDataTypes = (datasetId) => async (dispatch, getState) => {
  // only clear data types which can yield counts - `queryable` is a proxy for this
  const dataTypes = Object.values(getState().datasetDataTypes.itemsByID[datasetId].itemsByID).filter(
    (dt) => dt.queryable,
  );
  return await Promise.all(dataTypes.map((dt) => dispatch(clearDatasetDataType(datasetId, dt.id))));
};

export const saveProjectIfPossible = networkAction((project) => (dispatch, getState) => ({
  types: SAVE_PROJECT,
  url: `${getState().services.metadataService.url}/api/projects/${project.identifier}`,
  req: jsonRequest(project, "PUT"),
  err: `Error saving project '${project.title}'`, // TODO: More user-friendly error
  check: (state) => !state.projects.isDeleting || !state.projects.isSaving,
  onSuccess: () => {
    dispatch(endProjectEditing());
    message.success(`Project '${project.title}' saved!`);
  },
}));

export const addProjectDataset = networkAction((project, dataset, onSuccess = nop) => (_dispatch, getState) => ({
  types: ADD_PROJECT_DATASET,
  url: `${getState().services.metadataService.url}/api/datasets`,
  req: jsonRequest({ ...dataset, project: project.identifier }, "POST"),
  err: `Error adding dataset to project '${project.title}'`, // TODO: More user-friendly error
  // TODO: END ACTION?
  onSuccess: async () => {
    await onSuccess();
    message.success(`Added dataset '${dataset.title}' to project ${project.title}!`);
  },
}));

export const saveProjectDataset = networkAction((dataset, onSuccess = nop) => (_dispatch, getState) => ({
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

export const deleteProjectDataset = networkAction((project, dataset) => (_dispatch, getState) => ({
  types: DELETE_PROJECT_DATASET,
  params: { project, dataset },
  url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
  req: { method: "DELETE" },
  err: `Error deleting dataset '${dataset.title}'`,
}));

export const deleteProjectDatasetIfPossible = (project, dataset) => async (dispatch, getState) => {
  if (
    getState().projects.isAddingDataset ||
    getState().projects.isSavingDataset ||
    getState().projects.isDeletingDataset
  )
    return;
  try {
    await dispatch(clearDatasetDataTypes(dataset.identifier));
    await dispatch(deleteProjectDataset(project, dataset));
  } catch (err) {
    console.error(err);
    message.error(`Error deleting dataset '${dataset.title}'`);
  }
};

const addDatasetLinkedFieldSet = networkAction((dataset, linkedFieldSet, onSuccess) => (_dispatch, getState) => ({
  types: ADD_DATASET_LINKED_FIELD_SET,
  url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
  req: jsonRequest({ linked_field_sets: [...dataset.linked_field_sets, linkedFieldSet] }, "PATCH"),
  err: `Error adding linked field set '${linkedFieldSet.name}' to dataset '${dataset.title}'`,
  onSuccess: async () => {
    await onSuccess();
    message.success(`Added linked field set '${linkedFieldSet.name}' to dataset '${dataset.title}'`);
  },
}));

export const addDatasetLinkedFieldSetIfPossible =
  (dataset, linkedFieldSet, onSuccess = nop) =>
  (dispatch, getState) => {
    if (
      getState().projects.isAddingDataset ||
      getState().projects.isSavingDataset ||
      getState().projects.isDeletingDataset
    )
      return Promise.resolve();
    return dispatch(addDatasetLinkedFieldSet(dataset, linkedFieldSet, onSuccess));
  };

const saveDatasetLinkedFieldSet = networkAction(
  (dataset, index, linkedFieldSet, onSuccess) => (_dispatch, getState) => ({
    types: SAVE_DATASET_LINKED_FIELD_SET,
    url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
    req: jsonRequest(
      {
        linked_field_sets: dataset.linked_field_sets.map((l, i) => (i === index ? linkedFieldSet : l)),
      },
      "PATCH",
    ),
    err: `Error saving linked field set '${linkedFieldSet.name}' in dataset '${dataset.title}'`,
    onSuccess: async () => {
      await onSuccess();
      message.success(`Saved linked field set '${linkedFieldSet.name}' in dataset '${dataset.title}'`);
    },
  }),
);

export const saveDatasetLinkedFieldSetIfPossible =
  (dataset, index, linkedFieldSet, onSuccess = nop) =>
  (dispatch, getState) => {
    if (
      getState().projects.isAddingDataset ||
      getState().projects.isSavingDataset ||
      getState().projects.isDeletingDataset
    ) {
      return Promise.resolve();
    }
    return dispatch(saveDatasetLinkedFieldSet(dataset, index, linkedFieldSet, onSuccess));
  };

const deleteDatasetLinkedFieldSet = networkAction(
  (dataset, linkedFieldSet, linkedFieldSetIndex) => (_dispatch, getState) => ({
    types: DELETE_DATASET_LINKED_FIELD_SET,
    url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
    req: jsonRequest(
      {
        linked_field_sets: dataset.linked_field_sets.filter((_, i) => i !== linkedFieldSetIndex),
      },
      "PATCH",
    ),
    err: `Error deleting linked field set '${linkedFieldSet.name}' from dataset '${dataset.title}'`,
    onSuccess: () =>
      message.success(`Deleted linked field set '${linkedFieldSet.name}' from dataset '${dataset.title}'`),
  }),
);

export const deleteDatasetLinkedFieldSetIfPossible =
  (dataset, linkedFieldSet, linkedFieldSetIndex) => (dispatch, getState) => {
    if (
      getState().projects.isAddingDataset ||
      getState().projects.isSavingDataset ||
      getState().projects.isDeletingDataset
    ) {
      return Promise.resolve();
    }
    return dispatch(deleteDatasetLinkedFieldSet(dataset, linkedFieldSet, linkedFieldSetIndex));
  };

export const fetchIndividual = networkAction((individualID) => (_dispatch, getState) => ({
  types: FETCH_INDIVIDUAL,
  check: (state) => {
    const individualRecord = state.individuals.itemsByID[individualID] || {};
    // Don't fetch if already fetching or loaded:
    return state.services.metadataService && !individualRecord.isFetching && !individualRecord.data;
  },
  params: { individualID },
  url: `${getState().services.metadataService.url}/api/individuals/${individualID}`,
  err: `Error fetching individual ${individualID}`,
}));

const fetchIndividualPhenopackets = networkAction((individualID) => (_dispatch, getState) => ({
  types: FETCH_INDIVIDUAL_PHENOPACKETS,
  params: { individualID },
  url: `${getState().services.metadataService.url}/api/individuals/${individualID}/phenopackets`,
  err: `Error fetching phenopackets for individual ${individualID}`,
}));

export const fetchIndividualPhenopacketsIfNecessary = (individualID) => (dispatch, getState) => {
  const record = getState().individuals.phenopacketsByIndividualID[individualID] || {};
  if (!getState().services.metadataService.url) return Promise.resolve();
  if (record.isFetching || record.data) return Promise.resolve(); // Don't fetch if already fetching or loaded.
  return dispatch(fetchIndividualPhenopackets(individualID));
};
