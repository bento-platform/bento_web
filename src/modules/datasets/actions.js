import {beginFlow, createFlowActionTypes, createNetworkActionTypes, endFlow, networkAction} from "../../utils/actions";

export const FETCHING_DATASETS_DATATYPE = createFlowActionTypes("FETCHING_DATASETS_DATATYPE");
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

export const fetchDatasetsDataTypes = () => async (dispatch, getState) => {
    dispatch(beginFlow(FETCHING_DATASETS_DATATYPE));
    await Promise.all(
        Object.keys(getState().projects.datasetsByID).map(datasetID =>
            dispatch(fetchDatasetDataTypesSummaryIfPossible(datasetID))),
    );
    dispatch(endFlow(FETCHING_DATASETS_DATATYPE));
}

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
