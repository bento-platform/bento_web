import { beginFlow, createFlowActionTypes, createNetworkActionTypes, endFlow, networkAction } from "@/utils/actions";
import { getDataServices } from "../services/utils";

export const FETCHING_DATASETS_DATA_TYPES = createFlowActionTypes("FETCHING_DATASETS_DATA_TYPES");
export const FETCH_DATASET_DATA_TYPES_SUMMARY = createNetworkActionTypes("FETCH_DATASET_DATA_TYPES_SUMMARY");

export const FETCH_DATASET_SUMMARY = createNetworkActionTypes("FETCH_DATASET_SUMMARY");
export const FETCHING_ALL_DATASET_SUMMARIES = createFlowActionTypes("FETCHING_ALL_DATASET_SUMMARIES");

export const FETCH_DATASET_RESOURCES = createNetworkActionTypes("FETCH_DATASET_RESOURCES");

const fetchDatasetDataTypesSummary = networkAction((serviceInfo, datasetID) => ({
  types: FETCH_DATASET_DATA_TYPES_SUMMARY,
  params: { serviceInfo, datasetID },
  url: `${serviceInfo.url}/datasets/${datasetID}/data-types`,
}));

export const fetchDatasetDataTypesSummariesIfPossible = (datasetID) => async (dispatch, getState) => {
  if (getState().datasetDataTypes.itemsByID?.[datasetID]?.isFetching) return;
  await Promise.all(
    getDataServices(getState()).map((serviceInfo) => dispatch(fetchDatasetDataTypesSummary(serviceInfo, datasetID))),
  );
};

export const fetchDatasetsDataTypes = () => async (dispatch, getState) => {
  dispatch(beginFlow(FETCHING_DATASETS_DATA_TYPES));
  await Promise.all(
    Object.keys(getState().projects.datasetsByID).map((datasetID) =>
      dispatch(fetchDatasetDataTypesSummariesIfPossible(datasetID)),
    ),
  );
  dispatch(endFlow(FETCHING_DATASETS_DATA_TYPES));
};

const fetchDatasetSummary = networkAction((serviceInfo, datasetID) => ({
  types: FETCH_DATASET_SUMMARY,
  params: { serviceInfo, datasetID },
  url: `${serviceInfo.url}/datasets/${datasetID}/summary`,
}));

export const fetchDatasetSummariesIfPossible = (datasetID) => async (dispatch, getState) => {
  if (getState().datasetSummaries.isFetchingAll) return;
  dispatch(beginFlow(FETCHING_ALL_DATASET_SUMMARIES));
  await Promise.all(
    getDataServices(getState()).map((serviceInfo) => dispatch(fetchDatasetSummary(serviceInfo, datasetID))),
  );
  dispatch(endFlow(FETCHING_ALL_DATASET_SUMMARIES));
};

const fetchDatasetResources = networkAction((datasetID) => (_dispatch, getState) => ({
  types: FETCH_DATASET_RESOURCES,
  params: { datasetID },
  url: `${getState().services.metadataService.url}/api/datasets/${datasetID}/resources`,
  err: "Error fetching dataset resources",
}));
export const fetchDatasetResourcesIfNecessary = (datasetID) => (dispatch, getState) => {
  const datasetResources = getState().datasetResources.itemsByID[datasetID];
  if (datasetResources?.isFetching || datasetResources?.data) return;
  return dispatch(fetchDatasetResources(datasetID));
};
