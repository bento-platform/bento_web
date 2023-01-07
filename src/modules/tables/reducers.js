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
        case FETCH_TABLE_SUMMARY.RECEIVE:
            return {
                ...state,
                summariesByServiceArtifactAndTableID: {
                    ...state.summariesByServiceArtifactAndTableID,
                    [action.chordService.artifact]: {
                        ...(state.summariesByServiceArtifactAndTableID[action.chordService.artifact] || {}),
                        [action.tableID]: action.data,
                    }
                }
            };
        case FETCH_TABLE_SUMMARY.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};
