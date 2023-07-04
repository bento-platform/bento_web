import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_DATASET_SUMMARY = createNetworkActionTypes("FETCH_DATASET_SUMMARY");

const fetchDatasetSummary = networkAction((serviceInfo, datasetID) => ({
    types: FETCH_DATASET_SUMMARY,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/datasets/${datasetID}/summary`,  // TODO: Private...
}));

export const fetchDatasetSummaryIfPossible = (serviceInfo, datasetID) => (dispatch, getState) => {
    if (getState().datasetSummaries.isFetching) return;
    return dispatch(fetchDatasetSummary(serviceInfo, datasetID));
};
