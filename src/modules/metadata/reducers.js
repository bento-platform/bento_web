import { objectWithoutProp } from "@/utils/misc";

import {
  FETCH_PROJECTS,
  CREATE_PROJECT,
  DELETE_PROJECT,
  SAVE_PROJECT,
  ADD_PROJECT_DATASET,
  SAVE_PROJECT_DATASET,
  DELETE_PROJECT_DATASET,
  ADD_DATASET_LINKED_FIELD_SET,
  SAVE_DATASET_LINKED_FIELD_SET,
  DELETE_DATASET_LINKED_FIELD_SET,
  FETCH_INDIVIDUAL,
  FETCH_INDIVIDUAL_PHENOPACKETS,
  FETCH_OVERVIEW_SUMMARY,
  FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES,
  CREATE_PROJECT_JSON_SCHEMA,
  DELETE_PROJECT_JSON_SCHEMA,
} from "./actions";

const projectSort = (a, b) => a.title.localeCompare(b.title);

export const projects = (
  state = {
    isFetching: false,
    isCreating: false,
    isDeleting: false,
    isSaving: false,
    isAddingDataset: false,
    isSavingDataset: false,
    isDeletingDataset: false,

    extraPropertiesSchemaTypes: {},
    isFetchingExtraPropertiesSchemaTypes: false,
    isCreatingJsonSchema: false,
    isDeletingJsonSchema: false,

    items: [],
    itemsByID: {},

    datasetsByID: {},
  },
  action,
) => {
  switch (action.type) {
    case FETCH_PROJECTS.REQUEST:
      return { ...state, isFetching: true };

    case FETCH_PROJECTS.RECEIVE:
      return {
        ...state,
        items: action.data.toSorted(projectSort),
        itemsByID: Object.fromEntries(action.data.map((p) => [p.identifier, p])),
        datasetsByID: Object.fromEntries(
          action.data.flatMap((p) => p.datasets.map((d) => [d.identifier, { ...d, project: p.identifier }])),
        ),
      };

    case FETCH_PROJECTS.FINISH:
      return { ...state, isFetching: false };

    case CREATE_PROJECT.REQUEST:
      return { ...state, isCreating: true };

    case CREATE_PROJECT.RECEIVE:
      return {
        ...state,
        items: [...state.items, action.data].sort(projectSort),
        itemsByID: {
          ...state.itemsByID,
          [action.data.identifier]: action.data,
        },
      };

    case CREATE_PROJECT.FINISH:
      return { ...state, isCreating: false };

    case DELETE_PROJECT.REQUEST:
      return { ...state, isDeleting: true };

    case DELETE_PROJECT.RECEIVE:
      return {
        ...state,
        items: state.items.filter((p) => p.identifier !== action.project.identifier),
        itemsByID: Object.fromEntries(
          Object.entries(objectWithoutProp(state.itemsByID, action.project.identifier)).filter(
            ([projectID, _]) => projectID !== action.project.identifier,
          ),
        ),
      };

    case DELETE_PROJECT.FINISH:
      return { ...state, isDeleting: false };

    case SAVE_PROJECT.REQUEST:
      return { ...state, isSaving: true };

    case SAVE_PROJECT.RECEIVE:
      return {
        ...state,
        items: [...state.items.filter((p) => p.identifier !== action.data.identifier), action.data].sort(projectSort),
        itemsByID: {
          ...state.itemsByID,
          [action.data.identifier]: action.data,
        },
      };

    case SAVE_PROJECT.FINISH:
      return { ...state, isSaving: false };

    // ADD_PROJECT_DATASET
    case ADD_PROJECT_DATASET.REQUEST:
      return { ...state, isAddingDataset: true };

    case ADD_PROJECT_DATASET.RECEIVE: {
      const newDataset = action.data;
      const projectID = newDataset.project;
      return {
        ...state,
        isAddingDataset: false,
        items: state.items.map((p) =>
          p.identifier === newDataset.project ? { ...p, datasets: [...p.datasets, newDataset] } : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [projectID]: {
            ...(state.itemsByID[projectID] || {}),
            datasets: [...(state.itemsByID[projectID]?.datasets || []), newDataset],
          },
        },
        datasetsByID: {
          ...state.datasetsByID,
          [newDataset.identifier]: action.data,
        },
      };
    }

    case ADD_PROJECT_DATASET.FINISH:
      return { ...state, isAddingDataset: false };

    // DELETE_PROJECT_DATASET
    case DELETE_PROJECT_DATASET.REQUEST:
      return { ...state, isDeletingDataset: true };

    case DELETE_PROJECT_DATASET.RECEIVE: {
      const deleteDataset = (d) => d.identifier !== action.dataset.identifier;
      return {
        ...state,
        items: state.items.map((p) =>
          p.identifier === action.project.identifier ? { ...p, datasets: p.datasets.filter(deleteDataset) } : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [action.project.identifier]: {
            ...(state.itemsByID[action.project.identifier] || {}),
            datasets: ((state.itemsByID[action.project.identifier] || {}).datasets || []).filter(deleteDataset),
          },
        },
        datasetsByID: Object.fromEntries(Object.entries(state.datasetsByID).filter(([_, d]) => deleteDataset(d))),
      };
    }

    case DELETE_PROJECT_DATASET.FINISH:
      return { ...state, isDeletingDataset: false };

    case SAVE_PROJECT_DATASET.REQUEST:
    case ADD_DATASET_LINKED_FIELD_SET.REQUEST:
    case SAVE_DATASET_LINKED_FIELD_SET.REQUEST:
    case DELETE_DATASET_LINKED_FIELD_SET.REQUEST:
      return { ...state, isSavingDataset: true };

    case SAVE_PROJECT_DATASET.RECEIVE:
    case ADD_DATASET_LINKED_FIELD_SET.RECEIVE:
    case SAVE_DATASET_LINKED_FIELD_SET.RECEIVE:
    case DELETE_DATASET_LINKED_FIELD_SET.RECEIVE: {
      const replaceDataset = (d) => (d.identifier === action.data.identifier ? { ...d, ...action.data } : d);
      return {
        ...state,
        items: state.items.map((p) =>
          p.identifier === action.data.project ? { ...p, datasets: p.datasets.map(replaceDataset) } : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [action.data.project]: {
            ...(state.itemsByID[action.data.project] || {}),
            datasets: ((state.itemsByID[action.data.project] || {}).datasets || []).map(replaceDataset),
          },
        },
      };
    }

    case SAVE_PROJECT_DATASET.FINISH:
    case ADD_DATASET_LINKED_FIELD_SET.FINISH:
    case SAVE_DATASET_LINKED_FIELD_SET.FINISH:
    case DELETE_DATASET_LINKED_FIELD_SET.FINISH:
      return { ...state, isSavingDataset: false };

    // FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES
    case FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES.REQUEST:
      return { ...state, isFetchingExtraPropertiesSchemaTypes: true };
    case FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES.RECEIVE:
      return { ...state, extraPropertiesSchemaTypes: action.data };
    case FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES.FINISH:
      return { ...state, isFetchingExtraPropertiesSchemaTypes: false };

    // CREATE_PROJECT_JSON_SCHEMA
    case CREATE_PROJECT_JSON_SCHEMA.REQUEST:
      return { ...state, isCreatingJsonSchema: true };
    case CREATE_PROJECT_JSON_SCHEMA.RECEIVE:
      return {
        ...state,
        items: state.items.map((p) =>
          p.identifier === action.data.project ? { ...p, project_schemas: [...p.project_schemas, action.data] } : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [action.data.project]: {
            ...(state.itemsByID[action.data.project] || {}),
            project_schemas: [...(state.itemsByID[action.data.project]?.project_schemas ?? []), action.data],
          },
        },
      };
    case CREATE_PROJECT_JSON_SCHEMA.FINISH:
      return { ...state, isCreatingJsonSchema: false };

    // DELETE_PROJECT_JSON_SCHEMA
    case DELETE_PROJECT_JSON_SCHEMA.REQUEST:
      return { ...state, isDeletingJsonSchema: true };
    case DELETE_PROJECT_JSON_SCHEMA.RECEIVE: {
      const deleteSchema = (pjs) => pjs.id !== action.projectJsonSchema.id;
      return {
        ...state,
        items: state.items.map((p) =>
          p.identifier === action.projectJsonSchema.project
            ? { ...p, project_schemas: p.project_schemas.filter(deleteSchema) }
            : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [action.projectJsonSchema.project]: {
            ...(state.itemsByID[action.projectJsonSchema.project] || {}),
            project_schemas: (state.itemsByID[action.projectJsonSchema.project]?.project_schemas ?? []).filter(
              deleteSchema,
            ),
          },
        },
      };
    }
    case DELETE_PROJECT_JSON_SCHEMA.FINISH:
      return { ...state, isDeletingJsonSchema: false };

    default:
      return state;
  }
};

export const biosamples = (
  state = {
    itemsByID: {},
  },
  action,
) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const individuals = (
  state = {
    itemsByID: {},
    phenopacketsByIndividualID: {},
  },
  action,
) => {
  switch (action.type) {
    // FETCH_INDIVIDUAL

    case FETCH_INDIVIDUAL.REQUEST:
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [action.individualID]: {
            ...(state.itemsByID[action.individualID] || {}),
            isFetching: true,
          },
        },
      };
    case FETCH_INDIVIDUAL.RECEIVE:
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [action.individualID]: {
            ...(state.itemsByID[action.individualID] || {}),
            data: action.data,
          },
        },
      };
    case FETCH_INDIVIDUAL.FINISH:
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [action.individualID]: {
            ...(state.itemsByID[action.individualID] || {}),
            isFetching: false,
          },
        },
      };

    // FETCH_INDIVIDUAL_PHENOPACKETS

    case FETCH_INDIVIDUAL_PHENOPACKETS.REQUEST: {
      const { individualID } = action;
      return {
        ...state,
        phenopacketsByIndividualID: {
          ...state.phenopacketsByIndividualID,
          [individualID]: {
            ...(state.phenopacketsByIndividualID[individualID] ?? {}),
            isFetching: true,
          },
        },
      };
    }
    case FETCH_INDIVIDUAL_PHENOPACKETS.RECEIVE: {
      const { individualID, data } = action;
      return {
        ...state,
        phenopacketsByIndividualID: {
          ...state.phenopacketsByIndividualID,
          [individualID]: {
            ...(state.phenopacketsByIndividualID[individualID] ?? {}),
            data,
          },
        },
      };
    }
    case FETCH_INDIVIDUAL_PHENOPACKETS.FINISH: {
      const { individualID } = action;
      return {
        ...state,
        phenopacketsByIndividualID: {
          ...state.phenopacketsByIndividualID,
          [individualID]: {
            ...(state.phenopacketsByIndividualID[individualID] ?? {}),
            isFetching: false,
          },
        },
      };
    }

    default:
      return state;
  }
};

export const overviewSummary = (
  state = {
    data: {},
    isFetching: false,
    hasAttempted: false,
  },
  action,
) => {
  switch (action.type) {
    case FETCH_OVERVIEW_SUMMARY.REQUEST:
      return { ...state, data: {}, isFetching: true };
    case FETCH_OVERVIEW_SUMMARY.RECEIVE:
      return { ...state, data: action.data };
    case FETCH_OVERVIEW_SUMMARY.FINISH:
      return {
        ...state,
        data: state.data,
        isFetching: false,
        hasAttempted: true,
      };

    default:
      return state;
  }
};
