import {message} from "antd";

import "antd/es/message/style/css";

import {createNetworkActionTypes, networkAction} from "../../utils/actions";
import {createFormData} from "../../utils/requests";

export const FETCH_RUNS = createNetworkActionTypes("FETCH_RUNS");
export const FETCH_RUN_DETAILS = createNetworkActionTypes("FETCH_RUN_DETAILS");
export const FETCH_RUN_LOG_STDOUT = createNetworkActionTypes("FETCH_RUN_LOG_STDOUT");
export const FETCH_RUN_LOG_STDERR = createNetworkActionTypes("FETCH_RUN_LOG_STDERR");

export const SUBMIT_INGESTION_RUN = createNetworkActionTypes("SUBMIT_INGESTION_RUN");


// TODO: If needed
export const fetchRuns = networkAction(() => (dispatch, getState) => ({
    types: FETCH_RUNS,
    url: `${getState().services.wesService.url}/runs?with_details=true`,
    err: "Error fetching WES runs"
}));

export const receiveRunDetails = (runID, data) => ({
    type: FETCH_RUN_DETAILS.RECEIVE,
    runID,
    data
});

export const fetchRunDetails = networkAction(runID => (dispatch, getState) => ({
    types: FETCH_RUN_DETAILS,
    params: {runID},
    url: `${getState().services.wesService.url}/runs/${runID}`,
    err: `Error fetching run details for run ${runID}`
}));


const RUN_DONE_STATES = ["COMPLETE", "EXECUTOR_ERROR", "SYSTEM_ERROR", "CANCELED"];

export const fetchRunDetailsIfNeeded = runID => async (dispatch, getState) => {
    const state = getState();

    const needsUpdate = !state.runs.itemsByID.hasOwnProperty(runID)
        || (!state.runs.itemsByID[runID].isFetching && (
            !state.runs.itemsByID[runID].details ||
            (!RUN_DONE_STATES.includes(state.runs.itemsByID[runID].state) &&
                state.runs.itemsByID[runID].details.run_log.exit_code === null &&
                state.runs.itemsByID[runID].details.run_log.end_time === "")));

    if (!needsUpdate) return;

    await dispatch(fetchRunDetails(runID));
    const runDetails = getState().runs.itemsByID[runID].details;
    if (runDetails) {
        await Promise.all([
            dispatch(fetchRunLogStdOut(getState().runs.itemsByID[runID].details)),
            dispatch(fetchRunLogStdErr(getState().runs.itemsByID[runID].details)),
        ]);
    }
};

export const fetchAllRunDetailsIfNeeded = () => async (dispatch, getState) => {
    await Promise.all(getState().runs.items.map(r => dispatch(fetchRunDetailsIfNeeded(r.run_id))));
};


export const fetchRunLogStdOut = networkAction(runDetails => ({
    types: FETCH_RUN_LOG_STDOUT,
    params: {runID: runDetails.run_id},
    url: runDetails.run_log.stdout,
    parse: async r => r.text(),
    err: `Error fetching stdout for run ${runDetails.run_id}`
}));

export const fetchRunLogStdErr = networkAction(runDetails => ({
    types: FETCH_RUN_LOG_STDERR,
    params: {runID: runDetails.run_id},
    url: runDetails.run_log.stderr,
    parse: async r => r.text(),
    err: `Error fetching stderr for run ${runDetails.run_id}`
}));

export const fetchRunLogStreamsIfPossibleAndNeeded = runID => async (dispatch, getState) => {
    if (getState().runs.isFetching) return;
    const run = getState().runs.itemsByID[runID];
    if (!run || run.isFetching || !run.details) return;
    const runStreams = getState().runs.streamsByID[runID] || {};
    if ((runStreams.stdout || {}).isFetching || (runStreams.stderr || {}).isFetching) return;
    if (RUN_DONE_STATES.includes(run.state)
        && runStreams.hasOwnProperty("stdout")
        && runStreams.stdout.data !== null
        && runStreams.hasOwnProperty("stderr")
        && runStreams.stderr.data !== null) return;  // No new output expected
    await Promise.all([
        dispatch(fetchRunLogStdOut(run.details)),
        dispatch(fetchRunLogStdErr(run.details)),
    ]);
};


export const submitIngestionWorkflowRun = networkAction(
    (serviceInfo, tableID, workflow, inputs, redirect, hist) => (dispatch, getState) => ({
        types: SUBMIT_INGESTION_RUN,
        params: {serviceInfo, tableID},
        url: `${getState().services.wesService.url}/runs`,
        req: {
            method: "POST",
            body: createFormData({
                workflow_params: Object.fromEntries(Object.entries(inputs)
                    .map(([k, v]) => [`${workflow.id}.${k}`, v])),
                workflow_type: "WDL",  // TODO: Should eventually not be hard-coded
                workflow_type_version: "1.0",  // TODO: "
                workflow_engine_parameters: {},  // TODO: Currently unused
                workflow_url: `${serviceInfo.url}/workflows/${workflow.id}.wdl`,
                tags: {
                    workflow_id: workflow.id,
                    workflow_metadata: workflow,
                    // Remove CHORD_URL from the start of the service URL to make a relative path
                    ingestion_path: `/${
                        serviceInfo.url.replace(getState().nodeInfo.data.CHORD_URL, "")}/private/ingest`,
                    table_id: tableID  // TODO
                }
            })
        },
        err: "Error submitting ingestion workflow",
        onSuccess: async data => {
            await dispatch(fetchRuns());  // TODO: Maybe just load delta?
            message.success(`Ingestion with run ID "${data.run_id}" submitted!`);
            if (redirect) hist.push(redirect);
        }
    }));
