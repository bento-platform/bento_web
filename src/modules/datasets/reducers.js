import {
    FETCHING_DATASETS_DATA_TYPES,
    FETCH_DATASET_DATA_TYPES_SUMMARY,
    FETCH_DATASET_SUMMARY,
    FETCHING_ALL_DATASET_SUMMARIES, FETCH_DATASET_RESOURCES,
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
            return {...state, isFetchingAll: true};
        case FETCHING_DATASETS_DATA_TYPES.END:
            return {...state, isFetchingAll: false};
        case FETCH_DATASET_DATA_TYPES_SUMMARY.REQUEST:{
            const {datasetID} = action;
            return {
                ...state,
                itemsByID: {
                    ...state.itemsByID,
                    [datasetID]: {
                        itemsByID: state.itemsByID[datasetID]?.itemsByID ?? {},
                        isFetching: true,
                    },
                },
            };
        }
        case FETCH_DATASET_DATA_TYPES_SUMMARY.RECEIVE:{
            const {datasetID} = action;
            const itemsByID = Object.fromEntries(action.data.map(d => [d.id, d]));
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
        case FETCH_DATASET_DATA_TYPES_SUMMARY.FINISH:
        case FETCH_DATASET_DATA_TYPES_SUMMARY.ERROR:{
            const {datasetID} = action;
            return {
                ...state,
                itemsByID: {
                    ...state.itemsByID,
                    [datasetID]: {
                        ...state.itemsByID[datasetID],
                        isFetching: false,
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
    // Else, set key with value as is (boolean | string | undefined)
    const newValue = "object" === typeof value ? {
        ...(oldState.itemsByID[datasetID]?.[key] ?? {}),
        ...value,
    } : value;
    const newState = {
        ...oldState,
        itemsByID: {
            ...oldState.itemsByID,
            [datasetID]: {
                ...(oldState.itemsByID[datasetID] ?? {}),
                [key]: newValue,
            },
        },
    };
    return newState;
};


export const datasetSummaries = (
    state = {
        isFetchingAll: false,
        itemsByID: {},
    },
    action,
) => {
    switch (action.type) {
        case FETCH_DATASET_SUMMARY.REQUEST:
            return datasetItemSet(state, action.datasetID, "isFetching", true);
        case FETCH_DATASET_SUMMARY.RECEIVE:
            return datasetItemSet(state, action.datasetID, "data", action.data);
        case FETCH_DATASET_SUMMARY.FINISH:
            return datasetItemSet(state, action.datasetID, "isFetching", false);
        case FETCHING_ALL_DATASET_SUMMARIES.BEGIN:
            return {...state, isFetchingAll: true};
        case FETCHING_ALL_DATASET_SUMMARIES.END:
        case FETCHING_ALL_DATASET_SUMMARIES.TERMINATE:
            return {...state, isFetchingAll: false};
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
