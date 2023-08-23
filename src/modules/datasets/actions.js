import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_DATASET_DATATYPE = createNetworkActionTypes("FETCH_DATASET_DATATYPE");
export const FETCH_DATASET_SUMMARY = createNetworkActionTypes("FETCH_DATASET_SUMMARY");

const fetchDatasetDataTypeSummary = networkAction((serviceInfo, datasetID) => ({
    types: FETCH_DATASET_DATATYPE,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/datasets/${datasetID}/data-types`,
}));

export const fetchDatasetDataTypesSummaryIfPossible = (datasetID) => async (dispatch, getState) => {
    if (getState().datasetDataTypes.isFetching) return;
    await dispatch(fetchDatasetDataTypeSummary(getState().services.itemsByArtifact.metadata, datasetID));
    await dispatch(fetchDatasetDataTypeSummary(getState().services.itemsByArtifact.gohan, datasetID));
};

const fetchDatasetSummary = networkAction((serviceInfo, datasetID) => ({
    types: FETCH_DATASET_SUMMARY,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/datasets/${datasetID}/summary`,
}));

export const fetchDatasetSummaryIfPossible = (datasetID) => async (dispatch, getState) => {
    if (getState().datasetSummaries.isFetching) return;
    await dispatch(fetchDatasetSummary(getState().services.itemsByArtifact.metadata, datasetID));
    await dispatch(fetchDatasetSummary(getState().services.itemsByArtifact.gohan, datasetID));
};
