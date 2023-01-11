import {FETCH_TABLE_SUMMARY} from "./actions";

export const tableSummaries = (
    state = {
        isFetching: false,
        summariesByServiceArtifactAndTableID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_TABLE_SUMMARY.REQUEST:
            return {...state, isFetching: true};
        case FETCH_TABLE_SUMMARY.RECEIVE: {
            const {serviceInfo: {type: {artifact}}, tableID, data} = action;
            return {
                ...state,
                summariesByServiceArtifactAndTableID: {
                    ...state.summariesByServiceArtifactAndTableID,
                    [artifact]: {
                        ...(state.summariesByServiceArtifactAndTableID[artifact] || {}),
                        [tableID]: data,
                    }
                }
            };
        }
        case FETCH_TABLE_SUMMARY.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};
