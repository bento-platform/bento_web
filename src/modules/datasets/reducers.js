import {FETCH_DATASET_SUMMARY} from "./actions";

export const datasetSummaries = (
    state = {
        isFetching: false,
        summariesByServiceArtifactAndDatasetID: {},
    },
    action,
) => {
    switch (action.type) {
        case FETCH_DATASET_SUMMARY.REQUEST:
            return {...state, isFetching: true};
        case FETCH_DATASET_SUMMARY.RECEIVE: {
            const {serviceInfo: {type: {artifact}}, datasetID, data} = action;
            return {
                ...state,
                summariesByServiceArtifactAndDatasetID: {
                    ...state.summariesByServiceArtifactAndDatasetID,
                    [artifact]: {
                        ...(state.summariesByServiceArtifactAndDatasetID[artifact] || {}),
                        [datasetID]: data,
                    },
                },
            };
        }
        case FETCH_DATASET_SUMMARY.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};
