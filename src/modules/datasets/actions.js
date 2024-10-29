import { beginFlow, createFlowActionTypes, createNetworkActionTypes, endFlow, networkAction } from "@/utils/actions";
import { getDataServices } from "../services/utils";

export const FETCHING_DATASETS_DATA_TYPES = createFlowActionTypes("FETCHING_DATASETS_DATA_TYPES");
export const FETCH_DATASET_DATA_TYPES = createNetworkActionTypes("FETCH_DATASET_DATA_TYPES");

export const FETCH_SERVICE_DATASET_SUMMARY = createNetworkActionTypes("FETCH_SERVICE_DATASET_SUMMARY");
export const FETCHING_DATASET_SUMMARIES = createFlowActionTypes("FETCHING_DATASET_SUMMARIES");
export const INVALIDATE_DATASET_SUMMARIES = "INVALIDATE_DATASET_SUMMARIES";

export const FETCH_DATASET_RESOURCES = createNetworkActionTypes("FETCH_DATASET_RESOURCES");

const fetchDatasetDataTypesSummary = networkAction((serviceInfo, datasetID) => ({
  types: FETCH_DATASET_DATA_TYPES,
  params: { serviceInfo, datasetID },
  url: `${serviceInfo.url}/datasets/${datasetID}/data-types`,
}));

export const fetchDatasetDataTypesIfPossible = (datasetID) => async (dispatch, getState) => {
  if (getState().datasetDataTypes.itemsByID?.[datasetID]?.isFetching) return;
  await Promise.all(
    getDataServices(getState()).map((serviceInfo) => dispatch(fetchDatasetDataTypesSummary(serviceInfo, datasetID))),
  );
};

export const fetchDatasetsDataTypes = () => async (dispatch, getState) => {
  dispatch(beginFlow(FETCHING_DATASETS_DATA_TYPES));
  await Promise.all(
    Object.keys(getState().projects.datasetsByID).map((datasetID) =>
      dispatch(fetchDatasetDataTypesIfPossible(datasetID)),
    ),
  );
  dispatch(endFlow(FETCHING_DATASETS_DATA_TYPES));
};

const fetchServiceDatasetSummary = networkAction((serviceInfo, datasetID) => ({
  types: FETCH_SERVICE_DATASET_SUMMARY,
  params: { serviceInfo, datasetID },
  url: `${serviceInfo.url}/datasets/${datasetID}/summary`,
}));

export const fetchDatasetSummariesIfNeeded = (datasetID) => async (dispatch, getState) => {
  const existingSummaryState = getState().datasetSummaries.itemsByID[datasetID] ?? {};
  if (existingSummaryState.isFetching || (!existingSummaryState.isInvalid && existingSummaryState.hasAttempted)) return;
  dispatch(beginFlow(FETCHING_DATASET_SUMMARIES, { datasetID }));
  await Promise.all(
    getDataServices(getState()).map((serviceInfo) => dispatch(fetchServiceDatasetSummary(serviceInfo, datasetID))),
  );
  dispatch(endFlow(FETCHING_DATASET_SUMMARIES, { datasetID }));
};

export const invalidateDatasetSummaries = (datasetID) => ({ type: INVALIDATE_DATASET_SUMMARIES, datasetID });

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
