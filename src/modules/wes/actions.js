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

export const receiveRunDetails = (runID, data) => ({
    type: FETCH_RUN_DETAILS.RECEIVE,
    runID,
    data,
});

export const fetchRunDetails = networkAction(runID => (dispatch, getState) => ({
    types: FETCH_RUN_DETAILS,
    params: {runID},
    url: `${getState().services.wesService.url}/runs/${runID}`,
    err: `Error fetching run details for run ${runID}`,
}));


const RUN_DONE_STATES = ["COMPLETE", "EXECUTOR_ERROR", "SYSTEM_ERROR", "CANCELED"];

export const fetchRunDetailsIfNeeded = runID => async (dispatch, getState) => {
    const state = getState();

    const needsUpdate = !state.runs.itemsByID.hasOwnProperty(runID) || (
        !state.runs.itemsByID[runID].isFetching && (
            !state.runs.itemsByID[runID].details || (
                !RUN_DONE_STATES.includes(state.runs.itemsByID[runID].state) &&
                state.runs.itemsByID[runID].details.run_log.exit_code === null &&
                state.runs.itemsByID[runID].details.run_log.end_time === "")));

    if (!needsUpdate) return;

    await dispatch(fetchRunDetails(runID));
    if (getState().runs.itemsByID[runID].details) {
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
    (types, serviceInfo, workflow, params, inputs, tags, onSuccess, errorMessage) => (dispatch, getState) => {
        console.log(workflow);
        const runRequest = {
            workflow_params: Object.fromEntries(Object.entries(inputs)
                .map(([k, v]) => [`${workflow.id}.${k}`, v])),
            workflow_type: "WDL",  // TODO: Should eventually not be hard-coded
            workflow_type_version: "1.0",  // TODO: "
            workflow_engine_parameters: {},  // TODO: Currently unused
            workflow_url: `${serviceInfo.url}/workflows/${workflow.id}.wdl`,
            tags: {
                workflow_id: workflow.id,
                workflow_metadata: workflow,
                ...tags,
            },
        };

        return {
            types,
            params: {serviceInfo, request: runRequest, ...params},
            url: `${getState().services.wesService.url}/runs`,
            req: {
                method: "POST",
                body: createFormData(runRequest),
            },
            err: errorMessage,
            onSuccess,
        };
    });


export const submitIngestionWorkflowRun = (serviceInfo, projectID, datasetID, dataType, workflow, inputs, redirect, hist) =>
    (dispatch) =>
        dispatch(submitWorkflowRun(
            SUBMIT_INGESTION_RUN,
            serviceInfo,
            workflow,
            {projectID, datasetID, dataType},  // params
            inputs,
            {  // tags
                ingestion_url: `${serviceInfo.url}/private/ingest`,
                project_id: projectID,
                dataset_id: datasetID,
                data_type: dataType,
            },
            run => {  // onSuccess
                message.success(`Ingestion with run ID "${run.run_id}" submitted!`);
                if (redirect) hist.push(redirect);
            },
            "Error submitting ingestion workflow",  // errorMessage
        ));


export const submitAnalysisWorkflowRun = (serviceInfo, workflow, inputs, redirect, hist) => (dispatch) =>
    dispatch(submitWorkflowRun(
        SUBMIT_ANALYSIS_RUN,
        serviceInfo,
        workflow,
        {},  // params
        inputs,
        {},  // tags
        run => {  // onSuccess
            message.success(`Analysis with run ID "${run.run_id}" submitted!`);
            if (redirect) hist.push(redirect);
        },
        "Error submitting analysis workflow",  // errorMessage
    ));
