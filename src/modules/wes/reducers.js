import {
    FETCH_RUNS,

    FETCH_RUN_DETAILS,
    FETCH_RUN_LOG_STDOUT,
    FETCH_RUN_LOG_STDERR,

    SUBMIT_INGESTION_RUN,
} from "./actions";


const INITIAL_RUNS_STATE = {
    isFetching: false,
    isSubmittingIngestionRun: false,
    items: [],
    itemsByID: {},
    streamsByID: {},
};


const streamRequest = (state = INITIAL_RUNS_STATE, action, stream) => {
    const existingRun = (state.streamsByID[action.runID] || {});
    const existingStreamData = (existingRun[stream] || {}).data;
    return {
        ...state,
        streamsByID: {
            ...state.streamsByID,
            [action.runID]: {
                ...existingRun,
                [stream]: {isFetching: true, data: existingStreamData === undefined ? null : existingStreamData}
            }
        }
    };
};

const streamReceive = (state = INITIAL_RUNS_STATE, action, stream) => ({
    ...state,
    streamsByID: {
        ...state.streamsByID,
        [action.runID]: {
            ...(state.streamsByID[action.runID] || {}),
            [stream]: {isFetching: false, data: action.data}
        }
    }
});

const streamError = (state = INITIAL_RUNS_STATE, action, stream) => {
    const existingRun = (state.streamsByID[action.runID] || {});
    const existingStreamData = (existingRun[stream] || {}).data;
    return {
        ...state,
        streamsByID: {
            ...state.streamsByID,
            [action.runID]: {
                ...existingRun,
                [stream]: {isFetching: false, data: existingStreamData === undefined ? null : existingStreamData}
            }
        }
    };
};


export const runs = (
    state = INITIAL_RUNS_STATE,
    action
) => {
    switch (action.type) {
        case FETCH_RUNS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_RUNS.RECEIVE:
            return {
                ...state,
                items: action.data.map(r => ({
                    ...r,
                    details: r.details || null,
                    isFetching: false,
                })),
                itemsByID: Object.fromEntries(action.data.map(r => [r.run_id, {
                    ...r,
                    details: r.details || null,
                    isFetching: false,
                }]))
            };

        case FETCH_RUNS.FINISH:
            return {...state, isFetching: false};

        case FETCH_RUN_DETAILS.REQUEST:
            return {
                ...state,
                items: state.items.map(r => r.run_id === action.runID ? ({...r, isFetching: true}) : r),
                itemsByID: {
                    ...state.itemsByID,
                    [action.runID]: {...(state.itemsByID[action.runID] || {}), isFetching: true},
                }
            };

        case FETCH_RUN_DETAILS.RECEIVE:
            // Pull state out of received details to ensure it's up-to-date in both places
            return {
                ...state,
                items: state.items.map(r => r.run_id === action.runID
                    ? {...r, state: action.data.state || r.state, details: action.data}
                    : r),
                itemsByID: {
                    ...state.itemsByID,
                    [action.runID]: {
                        ...(state.itemsByID[action.runID] || {}),
                        state: action.data.state,
                        details: action.data,
                    },
                }
            };

        case FETCH_RUN_DETAILS.FINISH:
            return {
                ...state,
                items: state.items.map(r => r.run_id === action.runID ? {...r, isFetching: false} : r),
                itemsByID: {
                    ...state.itemsByID,
                    [action.runID]: {...(state.itemsByID[action.runID] || {}), isFetching: false},
                }
            };


        case FETCH_RUN_LOG_STDOUT.REQUEST:
            return streamRequest(state, action, "stdout");
        case FETCH_RUN_LOG_STDOUT.RECEIVE:
            return streamReceive(state, action, "stdout");
        case FETCH_RUN_LOG_STDOUT.ERROR:
            return streamError(state, action, "stdout");

        case FETCH_RUN_LOG_STDERR.REQUEST:
            return streamRequest(state, action, "stderr");
        case FETCH_RUN_LOG_STDERR.RECEIVE:
            return streamReceive(state, action, "stderr");
        case FETCH_RUN_LOG_STDERR.ERROR:
            return streamError(state, action, "stderr");


        case SUBMIT_INGESTION_RUN.REQUEST:
            return {...state, isSubmittingIngestionRun: true};

        case SUBMIT_INGESTION_RUN.RECEIVE:  // TODO: Do something here
        case SUBMIT_INGESTION_RUN.FINISH:
            return {...state, isSubmittingIngestionRun: false};

        default:
            return state;
    }
};
