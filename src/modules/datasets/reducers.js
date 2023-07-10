import {FETCH_DATASET_SUMMARY, FETCH_DATASETS_DATA_TYPES} from "./actions";

export const datasetSummaries = (
    state = {
        isFetching: false,
        summariesByServiceArtifactAndDatasetID: {},
    },
    action,
) => {
    switch (action.type) {
        case FETCH_DATASETS_DATA_TYPES.REQUEST:
            return {...state, isFetching: true};
        case FETCH_DATASETS_DATA_TYPES.RECEIVE:
            const {serviceInfo: {type: {artifact}}, datasetID, data} = action;
            return {
                ...state,
                summariesByServiceArtifactAndDatasetID: {
                    ...state.summariesByServiceArtifactAndDatasetID,
                    [artifact]: {
                        ...(state.summariesByServiceArtifactAndDatasetID[artifact] || {}),
                        [datasetID]: data,
                    }
                }
            }

        case FETCH_DATASETS_DATA_TYPES.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};
