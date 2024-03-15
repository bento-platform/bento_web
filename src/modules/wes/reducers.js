import {
    FETCH_RUNS,

    FETCH_RUN_DETAILS,
    FETCH_RUN_LOG_STDOUT,
    FETCH_RUN_LOG_STDERR,

    SUBMIT_WORKFLOW_RUN,
    SUBMIT_INGESTION_RUN,
    SUBMIT_ANALYSIS_RUN,
} from "./actions";


const INITIAL_RUNS_STATE = {
    isFetching: false,
    isSubmittingRun: false,
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
                [stream]: {isFetching: true, data: existingStreamData === undefined ? null : existingStreamData},
            },
        },
    };
};

const streamReceive = (state = INITIAL_RUNS_STATE, action, stream) => ({
    ...state,
    streamsByID: {
        ...state.streamsByID,
        [action.runID]: {
            ...(state.streamsByID[action.runID] || {}),
            [stream]: {isFetching: false, data: action.data},
        },
    },
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
                [stream]: {isFetching: false, data: existingStreamData === undefined ? null : existingStreamData},
            },
        },
    };
};


const makeRunSkeleton = (run, request) => ({
    ...run,
    state: "QUEUED",  // Default initial state
    timestamp: null,  // Will get replaced with a UTC timestamp when we receive updates or events
    run_log: null,
    request,
    outputs: {},  // TODO: is this the right default value? will be fine for now
    isFetching: false,
});


export const runs = (
    state = INITIAL_RUNS_STATE,
    action,
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
                }])),
            };

        case FETCH_RUNS.FINISH:
            return {...state, isFetching: false};

        case FETCH_RUN_DETAILS.REQUEST: {
            const newItem = { ...(state.itemsByID[action.runID] ?? {}), isFetching: true };
            return {
                ...state,
                items: state.items.map(r => r.run_id === action.runID ? newItem : r),
                itemsByID: { ...state.itemsByID, [action.runID]: newItem },
            };
        }

        case FETCH_RUN_DETAILS.RECEIVE: {
            // Pull state out of received details to ensure it's up-to-date in both places
            // Assign a timestamp when we get this action if there isn't one passed in; technically this can still
            // create a race condition with the websocket events, since if a websocket event is fired after an HTTP
            // update response is sent from WES, but before we receive the response, the state will be wrong.

            const timestamp = action.receivedAt;  // UTC timestamp
            const existingItem = state.itemsByID[action.runID] ?? {};
            const stateUpdate = !existingItem.timestamp || (timestamp > existingItem.timestamp)
                ? { timestamp, state: action.data.state }
                : {};

            console.debug(
                `run ${action.runID}: existing item timestamp:`, existingItem.timestamp, "| new timestamp:", timestamp,
                "new state:", stateUpdate ?? `keep existing (${existingItem.state})`);

            const newItem = {
                ...existingItem,
                ...stateUpdate,
                details: { ...action.data, state: stateUpdate.state ?? action.data.state },
            };

            return {
                ...state,
                items: state.items.map(r => r.run_id === action.runID ? newItem : r),
                itemsByID: { ...state.itemsByID, [action.runID]: newItem },
            };
        }

        case FETCH_RUN_DETAILS.FINISH:
            return {
                ...state,
                items: state.items.map(r => r.run_id === action.runID ? {...r, isFetching: false} : r),
                itemsByID: {
                    ...state.itemsByID,
                    [action.runID]: {...(state.itemsByID[action.runID] || {}), isFetching: false},
                },
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

        // SUBMIT_WORKFLOW_RUN

        case SUBMIT_WORKFLOW_RUN.REQUEST:
            return {...state, isSubmittingRun: true};

        case SUBMIT_WORKFLOW_RUN.RECEIVE: {
            // Create basic run object with no other details
            //  action.data is of structure {run_id} with no other props
            const {data, request} = action;
            const runSkeleton = makeRunSkeleton(data, request);
            return {
                ...state,
                items: [...state.items, runSkeleton],
                itemsByID: {...state.itemsByID, [data.run_id]: runSkeleton},
            };
        }

        case SUBMIT_WORKFLOW_RUN.FINISH:
            return {...state, isSubmittingRun: false};


        default:
            return state;
    }
};
