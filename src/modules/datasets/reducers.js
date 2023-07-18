import {FETCH_DATASET_SUMMARY} from "./actions";

export const datasetSummaries = (
    state = {
        isFetching: false,
        datasetDatatypesSummaries: [],
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
                datasetDatatypesSummaries: action.data,
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
