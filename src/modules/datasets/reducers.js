import {
  FETCH_DATASET_DATA_TYPES,
  FETCH_DATASET_RESOURCES,
  FETCH_SERVICE_DATASET_SUMMARY,
  FETCHING_DATASET_SUMMARIES,
  FETCHING_DATASETS_DATA_TYPES,
  INVALIDATE_DATASET_SUMMARIES,
} from "./actions";

export const datasetDataTypes = (
  state = {
    itemsByID: {},
    isFetchingAll: false,
  },
  action,
) => {
  switch (action.type) {
    case FETCHING_DATASETS_DATA_TYPES.BEGIN:
      return { ...state, isFetchingAll: true };
    case FETCHING_DATASETS_DATA_TYPES.END:
      return { ...state, isFetchingAll: false };
    case FETCH_DATASET_DATA_TYPES.REQUEST: {
      const { datasetID } = action;
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [datasetID]: {
            itemsByID: state.itemsByID[datasetID]?.itemsByID ?? {},
            hasAttempted: state.itemsByID[datasetID]?.hasAttempted ?? false,
            isFetching: true,
          },
        },
      };
    }
    case FETCH_DATASET_DATA_TYPES.RECEIVE: {
      const { datasetID } = action;
      const itemsByID = Object.fromEntries(action.data.map((d) => [d.id, d]));
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [datasetID]: {
            itemsByID: {
              ...state.itemsByID[datasetID].itemsByID,
              ...itemsByID,
            },
          },
        },
      };
    }
    case FETCH_DATASET_DATA_TYPES.FINISH:
    case FETCH_DATASET_DATA_TYPES.ERROR: {
      const { datasetID } = action;
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [datasetID]: {
            ...state.itemsByID[datasetID],
            isFetching: false,
            hasAttempted: true,
          },
        },
      };
    }
    default:
      return state;
  }
};

const datasetItemSet = (oldState, datasetID, key, value) => {
  // If value is an object, spread with key's oldState
  // Else, set key with value as is (array | boolean | string | undefined)
  const newValue =
    "object" === typeof value && !Array.isArray(value)
      ? {
          ...(oldState.itemsByID[datasetID]?.[key] ?? {}),
          ...value,
        }
      : value;
  return {
    ...oldState,
    itemsByID: {
      ...oldState.itemsByID,
      [datasetID]: {
        ...(oldState.itemsByID[datasetID] ?? {}),
        [key]: newValue,
      },
    },
  };
};

export const datasetSummaries = (
  state = {
    itemsByID: {},
  },
  action,
) => {
  // This reducer is a bit funky, since it is combining data from multiple services.
  switch (action.type) {
    case FETCH_SERVICE_DATASET_SUMMARY.RECEIVE:
      return datasetItemSet(state, action.datasetID, "data", action.data);
    case FETCHING_DATASET_SUMMARIES.BEGIN:
      return datasetItemSet(state, action.datasetID, "isFetching", true);
    case FETCHING_DATASET_SUMMARIES.END:
    case FETCHING_DATASET_SUMMARIES.TERMINATE:
      return {
        ...state,
        itemsByID: {
          ...state.itemsByID,
          [action.datasetID]: {
            ...(state.itemsByID[action.datasetID] ?? {}),
            isFetching: false,
            isInvalid: false,
            hasAttempted: true,
          },
        },
      };
    case INVALIDATE_DATASET_SUMMARIES:
      return datasetItemSet(state, action.datasetID, "isInvalid", true);
    default:
      return state;
  }
};

export const datasetResources = (
  state = {
    itemsByID: {},
  },
  action,
) => {
  switch (action.type) {
    case FETCH_DATASET_RESOURCES.REQUEST:
      return datasetItemSet(state, action.datasetID, "isFetching", true);
    case FETCH_DATASET_RESOURCES.RECEIVE:
      return datasetItemSet(state, action.datasetID, "data", action.data);
    case FETCH_DATASET_RESOURCES.FINISH:
      return datasetItemSet(state, action.datasetID, "isFetching", false);
    default:
      return state;
  }
};
