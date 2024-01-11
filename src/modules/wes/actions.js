import {message} from "antd";

import "antd/es/message/style/css";

import {createNetworkActionTypes, networkAction} from "../../utils/actions";
import {createFormData} from "../../utils/requests";

export const FETCH_RUNS = createNetworkActionTypes("FETCH_RUNS");
export const FETCH_RUN_DETAILS = createNetworkActionTypes("FETCH_RUN_DETAILS");
export const FETCH_RUN_LOG_STDOUT = createNetworkActionTypes("FETCH_RUN_LOG_STDOUT");
export const FETCH_RUN_LOG_STDERR = createNetworkActionTypes("FETCH_RUN_LOG_STDERR");

export const SUBMIT_INGESTION_RUN = createNetworkActionTypes("SUBMIT_INGESTION_RUN");
export const SUBMIT_ANALYSIS_RUN = createNetworkActionTypes("SUBMIT_ANALYSIS_RUN");


// TODO: If needed
export const fetchRuns = networkAction(() => (dispatch, getState) => ({
    types: FETCH_RUNS,
    url: `${getState().services.wesService.url}/runs?with_details=true`,
    err: "Error fetching WES runs",
}));

/**
 * Manually dispatch a run details receive event, equivalent to what is fired by the network action.
 * @param {string} runID
 * @param {Object} data
 * @param {number | undefined} ts
 * @return {{data, runID, type: string, ts: number | undefined}}
 */
export const receiveRunDetails = (runID, data, ts = undefined) => ({
    type: FETCH_RUN_DETAILS.RECEIVE,
    runID,
    data,
    ts,
});

export const fetchRunDetails = networkAction(runID => (dispatch, getState) => ({
    types: FETCH_RUN_DETAILS,
    params: {runID},
    url: `${getState().services.wesService.url}/runs/${runID}`,
    err: `Error fetching run details for run ${runID}`,
}));


const RUN_DONE_STATES = ["COMPLETE", "EXECUTOR_ERROR", "SYSTEM_ERROR", "CANCELED"];

export const fetchRunDetailsIfNeeded = runID => async (dispatch, getState) => {
    const run = getState().runs.itemsByID[runID];  // run | undefined

    const needsUpdate = !run || (
        !run.isFetching && (
            !run.details || (
                !RUN_DONE_STATES.includes(run.state) &&
                run.details.run_log.exit_code === null &&
                run.details.run_log.end_time === "")));

    if (!needsUpdate) return;

    await dispatch(fetchRunDetails(runID));
    if (getState().runs.itemsByID[runID].details) {  // need to re-fetch run from state to check if we've got details
        await dispatch(fetchRunLogs(runID));
    }
};

export const fetchAllRunDetailsIfNeeded = () => (dispatch, getState) =>
    Promise.all(getState().runs.items.map(r => dispatch(fetchRunDetailsIfNeeded(r.run_id))));


export const fetchRunLogStdOut = networkAction(runDetails => ({
    types: FETCH_RUN_LOG_STDOUT,
    params: {runID: runDetails.run_id},
    url: runDetails.run_log.stdout,
    parse: r => r.text(),
    err: `Error fetching stdout for run ${runDetails.run_id}`,
}));

export const fetchRunLogStdErr = networkAction(runDetails => ({
    types: FETCH_RUN_LOG_STDERR,
    params: {runID: runDetails.run_id},
    url: runDetails.run_log.stderr,
    parse: r => r.text(),
    err: `Error fetching stderr for run ${runDetails.run_id}`,
}));

export const fetchRunLogs = runID => (dispatch, getState) => Promise.all([
    dispatch(fetchRunLogStdOut(getState().runs.itemsByID[runID].details)),
    dispatch(fetchRunLogStdErr(getState().runs.itemsByID[runID].details)),
]);

export const fetchRunLogStreamsIfPossibleAndNeeded = runID => (dispatch, getState) => {
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
    return Promise.all([
        dispatch(fetchRunLogStdOut(run.details)),
        dispatch(fetchRunLogStdErr(run.details)),
    ]);
};


export const submitWorkflowRun = networkAction(
    (types, serviceBaseUrl, workflow, inputs, onSuccess, errorMessage, tags) => (dispatch, getState) => {
        const serviceUrlRStrip = serviceBaseUrl.replace(/\/$/, "");

        const runRequest = {
            workflow_params: Object.fromEntries(Object.entries(inputs ?? {})
                .map(([k, v]) => [`${workflow.id}.${k}`, v])),
            workflow_type: "WDL",  // TODO: Should eventually not be hard-coded
            workflow_type_version: "1.0",  // TODO: "
            workflow_engine_parameters: {},  // TODO: Currently unused
            workflow_url: `${serviceUrlRStrip}/workflows/${workflow.id}.wdl`,
            tags: {
                workflow_id: workflow.id,
                workflow_metadata: workflow,
                ...(tags ?? {}),
            },
        };

        return {
            types,
            params: { request: runRequest },
            url: `${getState().services.wesService.url}/runs`,
            req: {
                method: "POST",
                body: createFormData(runRequest),
            },
            err: errorMessage,
            onSuccess,
        };
    });


export const submitIngestionWorkflowRun = (serviceBaseUrl, workflow, inputs, redirect, hist) => (dispatch) =>
    dispatch(submitWorkflowRun(
        SUBMIT_INGESTION_RUN,
        serviceBaseUrl,
        workflow,
        inputs,
        run => {  // onSuccess
            message.success(`Ingestion with run ID "${run.run_id}" submitted!`);
            if (redirect) hist.push(redirect);
        },
        "Error submitting ingestion workflow",  // errorMessage
    ));


export const submitAnalysisWorkflowRun = (serviceBaseUrl, workflow, inputs, redirect, hist) => (dispatch) =>
    dispatch(submitWorkflowRun(
        SUBMIT_ANALYSIS_RUN,
        serviceBaseUrl,
        workflow,
        inputs,
        run => {  // onSuccess
            message.success(`Analysis with run ID "${run.run_id}" submitted!`);
            if (redirect) hist.push(redirect);
        },
        "Error submitting analysis workflow",  // errorMessage
    ));
