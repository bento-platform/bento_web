import { IGV_JS_GENOMES_JSON_URL } from "@/constants";
import { createNetworkActionTypes, networkAction } from "@/utils/actions";
import { jsonRequest } from "@/utils/requests";
import { extractQueriesFromDataTypeForms } from "@/utils/search";

export const PERFORM_GET_GOHAN_VARIANTS_OVERVIEW = createNetworkActionTypes("GET_GOHAN_VARIANTS_OVERVIEW");
export const PERFORM_SEARCH = createNetworkActionTypes("EXPLORER.PERFORM_SEARCH");
export const SET_IS_SUBMITTING_SEARCH = "EXPLORER.SET_IS_SUBMITTING_SEARCH";
export const CLEAR_SEARCH = "EXPLORER.CLEAR_SEARCH";
export const PERFORM_INDIVIDUAL_CSV_DOWNLOAD = createNetworkActionTypes("EXPLORER.PERFORM_INDIVIDUAL_CSV_DOWNLOAD");
export const PERFORM_BIOSAMPLE_CSV_DOWNLOAD = createNetworkActionTypes("EXPLORER.PERFORM_BIOSAMPLE_CSV_DOWNLOAD");
export const PERFORM_EXPERIMENT_CSV_DOWNLOAD = createNetworkActionTypes("EXPLORER.PERFORM_EXPERIMENT_CSV_DOWNLOAD");
export const ADD_DATA_TYPE_QUERY_FORM = "EXPLORER.ADD_DATA_TYPE_QUERY_FORM";
export const UPDATE_DATA_TYPE_QUERY_FORM = "EXPLORER.UPDATE_DATA_TYPE_QUERY_FORM";
export const REMOVE_DATA_TYPE_QUERY_FORM = "EXPLORER.REMOVE_DATA_TYPE_QUERY_FORM";
export const SET_SELECTED_ROWS = "EXPLORER.SET_SELECTED_ROWS";
export const FREE_TEXT_SEARCH = createNetworkActionTypes("FREE_TEXT_SEARCH");
export const SET_OTHER_THRESHOLD_PERCENTAGE = "EXPLORER.SET_OTHER_THRESHOLD_PERCENTAGE";
export const SET_TABLE_SORT_ORDER = "EXPLORER.SET_TABLE_SORT_ORDER";
export const RESET_TABLE_SORT_ORDER = "EXPLORER.RESET_TABLE_SORT_ORDER";
export const SET_ACTIVE_TAB = "EXPLORER.SET_ACTIVE_TAB";
export const FETCH_IGV_GENOMES = createNetworkActionTypes("EXPLORER.FETCH_IGV_GENOMES");
export const SET_IGV_POSITION = "EXPLORER.SET_IGV_POSITION";

const performSearch = networkAction((datasetID, dataTypeQueries, excludeFromAutoJoin = []) => (dispatch, getState) => ({
  types: PERFORM_SEARCH,
  url: `${getState().services.aggregationService.url}/dataset-search/${datasetID}`,
  params: { datasetID },
  req: jsonRequest(
    {
      data_type_queries: dataTypeQueries,
      join_query: null, // Will be autofilled by the aggregation service
      exclude_from_auto_join: excludeFromAutoJoin,
    },
    "POST",
  ),
  err: "Error performing search",
}));

export const performSearchIfPossible = (datasetID) => (dispatch, getState) => {
  if (getState().explorer.fetchingSearchByDatasetID[datasetID]) return;

  const dataTypeQueries = extractQueriesFromDataTypeForms(getState().explorer.dataTypeFormsByDatasetID[datasetID]);
  const excludeFromAutoJoin = [];

  // TODO: What to do if phenopacket data type not present?
  // Must include phenopacket/experiment query so we can include the data in the results.
  if (!dataTypeQueries.hasOwnProperty("phenopacket")) dataTypeQueries["phenopacket"] = true;
  if (!dataTypeQueries.hasOwnProperty("experiment")) {
    // We want all phenopackets matching the actual search query to be
    // included, even if 0 experiments are present – so if there aren't any
    // specific queries on experiments themselves, we exclude them from
    // filtering the phenopackets by way of the join query.

    dataTypeQueries["experiment"] = true;
    excludeFromAutoJoin.push("experiment");
  }

  return dispatch(performSearch(datasetID, dataTypeQueries, excludeFromAutoJoin));
};

// allows coordination between "real" search form and the variants UI form presented to the user
export const setIsSubmittingSearch = (isSubmittingSearch) => ({
  type: SET_IS_SUBMITTING_SEARCH,
  isSubmittingSearch,
});

export const clearSearch = (datasetID) => (dispatch, getState) => {
  if (getState().explorer.fetchingSearchByDatasetID[datasetID]) return;
  return dispatch({ type: CLEAR_SEARCH, datasetID });
};

// Helper function for CSV download functions
const performCSVDownloadHelper = (actionTypes, urlPath) =>
  networkAction((ids) => (_dispatch, getState) => ({
    types: actionTypes,
    url: `${getState().services.itemsByKind.metadata.url}/api/batch/${urlPath}`,
    req: jsonRequest(
      {
        id: ids,
        format: "csv",
      },
      "POST",
    ),
    parse: (r) => r.blob(),
    err: `Error fetching ${urlPath} CSV`,
  }));

const performIndividualsDownloadCSV = performCSVDownloadHelper(PERFORM_INDIVIDUAL_CSV_DOWNLOAD, "individuals");

export const performIndividualsDownloadCSVIfPossible =
  (datasetId, individualIds, allSearchResults) => (dispatch, _getState) => {
    const ids = individualIds.length ? individualIds : allSearchResults.map((sr) => sr.key);
    return dispatch(performIndividualsDownloadCSV(ids));
  };

// Action to perform the request to download biosamples CSV
const performBiosamplesDownloadCSV = performCSVDownloadHelper(PERFORM_BIOSAMPLE_CSV_DOWNLOAD, "biosamples");

// Function to download biosamples CSV if possible
export const performBiosamplesDownloadCSVIfPossible =
  (datasetId, biosampleIds, allSearchResults) => (dispatch, _getState) => {
    const ids = biosampleIds.length ? biosampleIds : allSearchResults.map((sr) => sr.key);
    return dispatch(performBiosamplesDownloadCSV(ids));
  };

// Action to perform the request to download experiments CSV
const performExperimentsDownloadCSV = performCSVDownloadHelper(PERFORM_EXPERIMENT_CSV_DOWNLOAD, "experiments");

// Function to download experiments CSV if possible
export const performExperimentsDownloadCSVIfPossible =
  (datasetId, experimentIds, allSearchResults) => (dispatch, _getState) => {
    const ids = experimentIds.length ? experimentIds : allSearchResults.map((sr) => sr.key);
    return dispatch(performExperimentsDownloadCSV(ids));
  };

export const addDataTypeQueryForm = (datasetID, dataType) => ({
  type: ADD_DATA_TYPE_QUERY_FORM,
  datasetID,
  dataType,
});

export const updateDataTypeQueryForm = (datasetID, dataType, fields) => ({
  type: UPDATE_DATA_TYPE_QUERY_FORM,
  datasetID,
  dataType,
  fields,
});

export const removeDataTypeQueryForm = (datasetID, dataType) => ({
  type: REMOVE_DATA_TYPE_QUERY_FORM,
  datasetID,
  dataType,
});

export const setSelectedRows = (datasetID, selectedRows) => ({
  type: SET_SELECTED_ROWS,
  datasetID,
  selectedRows,
});

export const setTableSortOrder = (datasetID, sortColumnKey, sortOrder, activeTab, currentPage) => ({
  type: SET_TABLE_SORT_ORDER,
  datasetID,
  sortColumnKey,
  sortOrder,
  activeTab,
  currentPage,
});

export const resetTableSortOrder = (datasetID) => ({
  type: RESET_TABLE_SORT_ORDER,
  datasetID,
});

export const setActiveTab = (datasetID, activeTab) => ({
  type: SET_ACTIVE_TAB,
  datasetID,
  activeTab,
});

// free-text search
// search unpaginated for now, since that's how standard queries are currently handled
const performFreeTextSearch = networkAction(
  (datasetID, term) => (dispatch, getState) =>
    console.log("performFreeTextSearch", datasetID, term) || {
      types: FREE_TEXT_SEARCH,
      params: { datasetID },
      url:
        `${getState().services.metadataService.url}/api/individuals?search=${term}&page_size=10000` +
        "&format=bento_search_result",
      err: `Error searching in all records with term ${term}`,
    },
);

export const performFreeTextSearchIfPossible = (datasetID, term) => (dispatch, _getState) => {
  return dispatch(performFreeTextSearch(datasetID, term));
};

export const setOtherThresholdPercentage = (threshold) => ({
  type: SET_OTHER_THRESHOLD_PERCENTAGE,
  otherThresholdPercentage: threshold,
});

export const setIgvPosition = (igvPosition) => ({
  type: SET_IGV_POSITION,
  igvPosition,
});

const _fetchIgvGenomes = networkAction(() => ({
  types: FETCH_IGV_GENOMES,
  url: IGV_JS_GENOMES_JSON_URL,
  err: "Error fetching igv.js genomes",
}));

export const fetchIgvGenomes = () => (dispatch, getState) => {
  if (getState().igvGenomes.hasAttempted || getState().igvGenomes.isFetching) {
    return Promise.resolve();
  }
  return dispatch(_fetchIgvGenomes());
};

export const performGetGohanVariantsOverviewIfPossible = networkAction(() => (_dispatch, getState) => ({
  types: PERFORM_GET_GOHAN_VARIANTS_OVERVIEW,
  url: `${getState().services.itemsByKind.gohan?.url}/variants/overview`,
  check: (state) => !!state.services.itemsByKind.gohan,
  err: "error getting Gohan variants overview",
}));
