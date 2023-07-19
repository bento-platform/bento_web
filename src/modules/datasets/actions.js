import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_DATASET_DATATYPE = createNetworkActionTypes("FETCH_DATASET_DATATYPE");
export const FETCH_DATASET_SUMMARY = createNetworkActionTypes("FETCH_DATASET_SUMMARY");

const fetchDatasetDataTypeSummary = networkAction((serviceInfo, datasetID) => ({
    types: FETCH_DATASET_DATATYPE,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/datasets/${datasetID}/data-types`,
}));

export const fetchDatasetDataTypesSummaryIfPossible = (datasetID) => (dispatch, getState) => {
    if (getState().datasetDataTypes.isFetching) return;
    return dispatch(fetchDatasetDataTypeSummary(getState().services.itemsByArtifact.metadata, datasetID));
};

const fetchDatasetSummary = networkAction((serviceInfo, datasetID) => ({
    types: FETCH_DATASET_SUMMARY,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/datasets/${datasetID}/summary`,
}));

export const fetchDatsetSummaryIfPossible = (datasetID) => (dispatch, getState) => {
    if (getState().datasetSummaries.isFetching) return;
    return dispatch(fetchDatasetSummary(getState().services.itemsByArtifact.metadata, datasetID))
};
