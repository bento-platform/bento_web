import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_DATASET_SUMMARY = createNetworkActionTypes("FETCH_DATASET_SUMMARY");

const fetchDatasetSummary = networkAction((serviceInfo, datasetID) => ({
    types: FETCH_DATASET_SUMMARY,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/datasets/${datasetID}/summary`,
}));

export const fetchDatasetSummaryIfPossible = (datasetID) => (dispatch, getState) => {
    if (getState().datasetSummaries.isFetching) return;
    return dispatch(fetchDatasetSummary(getState().services.itemsByArtifact.metadata, datasetID));
};
