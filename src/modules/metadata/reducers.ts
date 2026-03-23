import type { Reducer } from "redux";

import { arrayToObjectByProperty, objectWithoutProp } from "@/utils/misc";
import type { DatasetModel, ProjectScopedDatasetModel } from "@/types/dataset";
import type { Project, ProjectJSONSchema } from "./types";

import {
  FETCH_PROJECTS,
  INVALIDATE_PROJECTS,
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
  FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES,
  CREATE_PROJECT_JSON_SCHEMA,
  DELETE_PROJECT_JSON_SCHEMA,
  FETCH_DISCOVERY_SCHEMA,
} from "./actions";

const projectSort = (a: Project, b: Project) => a.title.localeCompare(b.title);

type ProjectsState = {
  isFetching: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  isInvalid: boolean;

  isAddingDataset: boolean;
  isSavingDataset: boolean;
  isDeletingDataset: boolean;

  extraPropertiesSchemaTypes: Record<string, unknown>;
  isFetchingExtraPropertiesSchemaTypes: boolean;
  isCreatingJsonSchema: boolean;
  isDeletingJsonSchema: boolean;

  items: Project[];
  itemsByID: Record<string, Project>;

  datasets: ProjectScopedDatasetModel[];
  datasetsByID: Record<string, ProjectScopedDatasetModel>;
};

export const projects: Reducer<ProjectsState> = (
  state = {
    isFetching: false,
    isCreating: false,
    isDeleting: false,
    isSaving: false,
    isInvalid: false,

    isAddingDataset: false,
    isSavingDataset: false,
    isDeletingDataset: false,

    extraPropertiesSchemaTypes: {},
    isFetchingExtraPropertiesSchemaTypes: false,
    isCreatingJsonSchema: false,
    isDeletingJsonSchema: false,

    items: [],
    itemsByID: {},

    datasets: [],
    datasetsByID: {},
  },
  action,
) => {
  switch (action.type) {
    case FETCH_PROJECTS.REQUEST:
      return { ...state, isFetching: true };

    case FETCH_PROJECTS.RECEIVE: {
      const projects = [...(action.data as Project[])].sort(projectSort);
      const datasets: ProjectScopedDatasetModel[] = projects.flatMap((p: Project) =>
        (p.datasets_v2 ?? []).map((d: DatasetModel) => ({ ...d, project: p.identifier })),
      );
      return {
        ...state,
        items: projects,
        itemsByID: arrayToObjectByProperty(projects, "identifier"),
        datasets,
        datasetsByID: arrayToObjectByProperty(datasets, "identifier"),
      };
    }

    case FETCH_PROJECTS.FINISH:
      return { ...state, isFetching: false, isInvalid: false };

    case INVALIDATE_PROJECTS:
      return { ...state, isInvalid: true };

    case CREATE_PROJECT.REQUEST:
      return { ...state, isCreating: true };

    case CREATE_PROJECT.RECEIVE: {
      const newProject = action.data as Project;
      return {
        ...state,
        items: [...state.items, newProject].sort(projectSort),
        itemsByID: {
          ...state.itemsByID,
          [newProject.identifier]: newProject,
        },
      };
    }

    case CREATE_PROJECT.FINISH:
      return { ...state, isCreating: false };

    case DELETE_PROJECT.REQUEST:
      return { ...state, isDeleting: true };

    case DELETE_PROJECT.RECEIVE: {
      const deletedProject = action.project as Project;
      return {
        ...state,
        items: state.items.filter((p) => p.identifier !== deletedProject.identifier),
        itemsByID: Object.fromEntries(
          Object.entries(objectWithoutProp(state.itemsByID, deletedProject.identifier)).filter(
            ([projectID]) => projectID !== deletedProject.identifier,
          ),
        ),
      };
    }

    case DELETE_PROJECT.FINISH:
      return { ...state, isDeleting: false };

    case SAVE_PROJECT.REQUEST:
      return { ...state, isSaving: true };

    case SAVE_PROJECT.RECEIVE: {
      const savedProject = action.data as Project;
      return {
        ...state,
        items: [...state.items.filter((p) => p.identifier !== savedProject.identifier), savedProject].sort(projectSort),
        itemsByID: {
          ...state.itemsByID,
          [savedProject.identifier]: savedProject,
        },
      };
    }

    case SAVE_PROJECT.FINISH:
      return { ...state, isSaving: false };

    // ADD_PROJECT_DATASET
    case ADD_PROJECT_DATASET.REQUEST:
      return { ...state, isAddingDataset: true };

    case ADD_PROJECT_DATASET.RECEIVE: {
      const newDataset = action.data as ProjectScopedDatasetModel;
      const projectID = newDataset.project;
      return {
        ...state,
        isAddingDataset: false,
        items: state.items.map((p) =>
          p.identifier === projectID ? { ...p, datasets_v2: [...(p.datasets_v2 ?? []), newDataset] } : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [projectID]: {
            ...(state.itemsByID[projectID] || {}),
            datasets_v2: [...(state.itemsByID[projectID]?.datasets_v2 ?? []), newDataset],
          },
        },
        datasets: [...state.datasets, newDataset],
        datasetsByID: {
          ...state.datasetsByID,
          [newDataset.identifier]: newDataset,
        },
      };
    }

    case ADD_PROJECT_DATASET.FINISH:
      return { ...state, isAddingDataset: false };

    // DELETE_PROJECT_DATASET
    case DELETE_PROJECT_DATASET.REQUEST:
      return { ...state, isDeletingDataset: true };

    case DELETE_PROJECT_DATASET.RECEIVE: {
      const deletedDataset = action.dataset as ProjectScopedDatasetModel;
      const deletedProject = action.project as Project;
      const deleteDataset = (d: DatasetModel) => d.identifier !== deletedDataset.identifier;
      return {
        ...state,
        items: state.items.map((p) =>
          p.identifier === deletedProject.identifier ? { ...p, datasets_v2: (p.datasets_v2 ?? []).filter(deleteDataset) } : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [deletedProject.identifier]: {
            ...(state.itemsByID[deletedProject.identifier] || {}),
            datasets_v2: ((state.itemsByID[deletedProject.identifier] || {}).datasets_v2 ?? []).filter(deleteDataset),
          },
        },
        datasets: state.datasets.filter((d) => d.identifier !== deletedDataset.identifier),
        datasetsByID: objectWithoutProp(state.datasetsByID, deletedDataset.identifier),
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
      const updatedDataset = action.data as ProjectScopedDatasetModel;
      const replaceDataset = (d: DatasetModel): ProjectScopedDatasetModel => (
        d.identifier === updatedDataset.identifier ? { ...d, ...updatedDataset } : { ...d, project: updatedDataset.project }
      );
      return {
        ...state,
        items: state.items.map((p) =>
          p.identifier === updatedDataset.project ? { ...p, datasets_v2: (p.datasets_v2 ?? []).map(replaceDataset) } : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [updatedDataset.project]: {
            ...(state.itemsByID[updatedDataset.project] || {}),
            datasets_v2: ((state.itemsByID[updatedDataset.project] || {}).datasets_v2 ?? []).map(replaceDataset),
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
      return { ...state, extraPropertiesSchemaTypes: action.data as Record<string, unknown> };
    case FETCH_EXTRA_PROPERTIES_SCHEMA_TYPES.FINISH:
      return { ...state, isFetchingExtraPropertiesSchemaTypes: false };

    // CREATE_PROJECT_JSON_SCHEMA
    case CREATE_PROJECT_JSON_SCHEMA.REQUEST:
      return { ...state, isCreatingJsonSchema: true };
    case CREATE_PROJECT_JSON_SCHEMA.RECEIVE: {
      const newSchema = action.data as ProjectJSONSchema;
      return {
        ...state,
        items: state.items.map((p) =>
          p.identifier === newSchema.project ? { ...p, project_schemas: [...(p.project_schemas ?? []), newSchema] } : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [newSchema.project!]: {
            ...(state.itemsByID[newSchema.project!] || {}),
            project_schemas: [...(state.itemsByID[newSchema.project!]?.project_schemas ?? []), newSchema],
          },
        },
      };
    }
    case CREATE_PROJECT_JSON_SCHEMA.FINISH:
      return { ...state, isCreatingJsonSchema: false };

    // DELETE_PROJECT_JSON_SCHEMA
    case DELETE_PROJECT_JSON_SCHEMA.REQUEST:
      return { ...state, isDeletingJsonSchema: true };
    case DELETE_PROJECT_JSON_SCHEMA.RECEIVE: {
      const deletedSchema = action.projectJsonSchema as ProjectJSONSchema;
      const deleteSchema = (pjs: ProjectJSONSchema) => pjs.id !== deletedSchema.id;
      return {
        ...state,
        items: state.items.map((p) =>
          p.identifier === deletedSchema.project
            ? { ...p, project_schemas: (p.project_schemas ?? []).filter(deleteSchema) }
            : p,
        ),
        itemsByID: {
          ...state.itemsByID,
          [deletedSchema.project!]: {
            ...(state.itemsByID[deletedSchema.project!] || {}),
            project_schemas: (state.itemsByID[deletedSchema.project!]?.project_schemas ?? []).filter(deleteSchema),
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

type BiosamplesState = {
  itemsByID: Record<string, unknown>;
};

export const biosamples: Reducer<BiosamplesState> = (
  state = {
    itemsByID: {},
  },
) => state;

type IndividualRecord = {
  isFetching?: boolean;
  data?: unknown;
};

type IndividualsState = {
  itemsByID: Record<string, IndividualRecord>;
  phenopacketsByIndividualID: Record<string, IndividualRecord>;
};

export const individuals: Reducer<IndividualsState> = (
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
          [action.individualID as string]: {
            ...(state.itemsByID[action.individualID as string] || {}),
            isFetching: true,
          },
        },
      };
    case FETCH_INDIVIDUAL.RECEIVE:
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [action.individualID as string]: {
            ...(state.itemsByID[action.individualID as string] || {}),
            data: action.data,
          },
        },
      };
    case FETCH_INDIVIDUAL.FINISH:
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [action.individualID as string]: {
            ...(state.itemsByID[action.individualID as string] || {}),
            isFetching: false,
          },
        },
      };

    // FETCH_INDIVIDUAL_PHENOPACKETS

    case FETCH_INDIVIDUAL_PHENOPACKETS.REQUEST: {
      const { individualID } = action as unknown as { individualID: string };
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
      const { individualID, data } = action as unknown as { individualID: string; data: unknown };
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
      const { individualID } = action as unknown as { individualID: string };
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

type DiscoveryState = {
  discoverySchema: Record<string, unknown>;
};

export const discovery: Reducer<DiscoveryState> = (
  state = {
    discoverySchema: {},
  },
  action,
) => {
  switch (action.type) {
    case FETCH_DISCOVERY_SCHEMA.RECEIVE:
      return {
        ...state,
        discoverySchema: action.data as Record<string, unknown>,
      };
    default:
      return state;
  }
};
