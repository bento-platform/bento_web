import {FETCHING_DATASETS_DATA_TYPES, FETCH_DATASET_DATA_TYPES_SUMMARY, FETCH_DATASET_SUMMARY} from "./actions";

export const datasetDataTypes = (
    state = {
        itemsById: {},
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
                itemsById: {
                    ...state.itemsById,
                    [datasetID]: {
                        itemsById: state.itemsById[datasetID]?.itemsById ?? {},
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
                itemsById: {
                    ...state.itemsById,
                    [datasetID]: {
                        itemsById: {
                            ...state.itemsById[datasetID].itemsById,
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
                itemsById: {
                    ...state.itemsById,
                    [datasetID]: {
                        ...state.itemsById[datasetID],
                        isFetching: false,
                    },
                },
            };
        }
        default:
            return state;
    }
};


export const datasetSummaries = (
    state = {
        itemsById: {},
    },
    action,
) => {
    switch (action.type) {
        case FETCH_DATASET_SUMMARY.REQUEST:{
            const {datasetID} = action;
            return {
                ...state,
                itemsById: {
                    ...state.itemsById,
                    [datasetID]: {
                        ...(state.itemsById[datasetID] ?? {}),
                    },
                },
            };
        }
        case FETCH_DATASET_SUMMARY.RECEIVE:{
            const {datasetID} = action;
            return {
                ...state,
                itemsById: {
                    ...state.itemsById,
                    [datasetID]: {
                        ...state.itemsById[datasetID],
                        ...action.data,
                    },
                },
            };
        }
        case FETCH_DATASET_SUMMARY.FINISH:
        case FETCH_DATASET_SUMMARY.ERROR:
            return {
                ...state,
            };
        default:
            return state;
    }
};
