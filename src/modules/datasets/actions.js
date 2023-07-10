import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_DATASET_SUMMARY = createNetworkActionTypes("FETCH_DATASET_SUMMARY");
export const FETCH_DATASETS_DATA_TYPES = createNetworkActionTypes("FETCH_DATASETS_DATA_TYPES");

export const fetchDatasetsDataTypes = networkAction((serviceInfo, dataType) => ({
    types: FETCH_DATASETS_DATA_TYPES,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/datasets?${createURLSearchParams({"data-type": dataType.id}).toString()}`,
    err: `Error fetching datasets from service '${serviceInfo.name}' (data type ${dataType.id})`
}));

const fetchDatasetSummary = networkAction((serviceInfo, datasetID) => ({
    types: FETCH_DATASET_SUMMARY,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/datasets/${datasetID}/summary`,  // TODO: Private...
}));

export const fetchDatasetSummaryIfPossible = (serviceInfo, datasetID) => (dispatch, getState) => {
    if (getState().datasetSummaries.isFetching) return;
    return dispatch(fetchDatasetSummary(serviceInfo, datasetID));
};
