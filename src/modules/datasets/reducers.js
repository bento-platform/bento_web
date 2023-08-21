import {FETCH_DATASET_DATATYPE, FETCH_DATASET_SUMMARY} from "./actions";

export const datasetDataTypes = (
    state = {
        isFetching: false,
        itemsById: {},
    },
    action,
) => {
    switch (action.type) {
        case FETCH_DATASET_DATATYPE.REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case FETCH_DATASET_DATATYPE.RECEIVE:
            return {
                ...state,
                itemsById: {
                    ...state.itemsById,
                    [action.datasetID]: action.data,
                },
            };
        case FETCH_DATASET_DATATYPE.FINISH:
        case FETCH_DATASET_DATATYPE.ERROR:
            return {
                ...state,
                isFetching: false,
            };
        default:
            return state;
    }
};


export const datasetSummaries = (
    state = {
        isFetching: false,
        itemsById: {},
    },
    action,
) => {
    switch (action.type) {
        case FETCH_DATASET_SUMMARY.REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case FETCH_DATASET_SUMMARY.RECEIVE:
            return {
                ...state,
                itemsById: {
                    ...state.itemsById,
                    [action.datasetID]: action.data,
                },
            };
        case FETCH_DATASET_SUMMARY.FINISH:
        case FETCH_DATASET_SUMMARY.ERROR:
            return {
                ...state,
                isFetching: false,
            };
        default:
            return state;
    }
};