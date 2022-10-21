import {createNetworkActionTypes, networkAction} from "../../utils/actions";
import {jsonRequest} from "../../utils/requests";
import {extractQueriesFromDataTypeForms} from "../../utils/search";

import FileSaver from "file-saver";

export const PERFORM_SEARCH = createNetworkActionTypes("EXPLORER.PERFORM_SEARCH");
export const PERFORM_INDIVIDUAL_CSV_DOWNLOAD = createNetworkActionTypes("EXPLORER.PERFORM_INDIVIDUAL_CSV_DOWNLOAD");
export const ADD_DATA_TYPE_QUERY_FORM = "EXPLORER.ADD_DATA_TYPE_QUERY_FORM";
export const UPDATE_DATA_TYPE_QUERY_FORM = "EXPLORER.UPDATE_DATA_TYPE_QUERY_FORM";
export const REMOVE_DATA_TYPE_QUERY_FORM = "EXPLORER.REMOVE_DATA_TYPE_QUERY_FORM";
export const SET_SELECTED_ROWS = "EXPLORER.SET_SELECTED_ROWS";
export const SET_AUTO_QUERY_PAGE_TRANSITION = "EXPLORER.SET_AUTO_QUERY_PAGE_TRANSITION";
export const NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION = "EXPLORER.NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION";
export const FREE_TEXT_SEARCH = createNetworkActionTypes("FREE_TEXT_SEARCH");
export const SET_OTHER_THRESHOLD_PERCENTAGE = "EXPLORER.SET_OTHER_THRESHOLD_PERCENTAGE";
export const SET_IS_FETCHING_INDIVIDUALS_CSV = "EXPLORER.SET_IS_FETCHING_INDIVIDUALS_CSV";

const performSearch = networkAction((datasetID, dataTypeQueries, excludeFromAutoJoin = []) =>
    (dispatch, getState) => ({
        types: PERFORM_SEARCH,
        url: `${getState().services.federationService.url}/private/dataset-search/${datasetID}`,
        params: {datasetID},
        req: jsonRequest({
            data_type_queries: dataTypeQueries,
            join_query: null,  // Will get auto-filled by the federation service,
            exclude_from_auto_join: excludeFromAutoJoin,
        }, "POST"),
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

export const performIndividualsDownloadCSVIfPossible = (datasetId, individualIds, allSearchResults) =>
    (dispatch, getState) => {

        dispatch(setIsFetchingIndividualsCSV(true));
        const ids = individualIds.length ? individualIds : allSearchResults.map(sr => sr.key);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "id": ids,
            "format": "csv"
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };
        fetch(`${getState().services.itemsByArtifact.metadata.url}/api/batch/individuals`, requestOptions)
            .then(response => response.blob())
            .then(result => {
                FileSaver.saveAs(result, "data.csv");
            })
            .catch(error => console.log("error", error));
        dispatch(setIsFetchingIndividualsCSV(false));
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

export const setAutoQueryPageTransition = (priorPageUrl, type, field, value) => ({
    type: SET_AUTO_QUERY_PAGE_TRANSITION,
    isAutoQuery: true,
    pageUrlBeforeAutoQuery: priorPageUrl,
    autoQueryType: type,
    autoQueryField: field,
    autoQueryValue: value,
});

export const neutralizeAutoQueryPageTransition = () => ({
    type: NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION,
    isAutoQuery: false,
    pageUrlBeforeAutoQuery: undefined,
    autoQueryType: undefined,
    autoQueryField: undefined,
    autoQueryValue: undefined,
});

// free-text search
// search unpaginated for now, since that's how standard queries are currently handled
const performFreeTextSearch = networkAction((datasetID, term) => (dispatch, getState) => ({
    types: FREE_TEXT_SEARCH,
    params: {datasetID},
    url: `${getState().services.metadataService.url}/api/individuals?search=${term}&page_size=10000` +
        "&format=bento_search_result",
    err: `Error searching in all records with term ${term}`,
}));

export const performFreeTextSearchIfPossible = (datasetID, term) => (dispatch, _getState) => {
    return dispatch(performFreeTextSearch(datasetID, term));
};

export const setOtherThresholdPercentage = (threshold) => ({
    type: SET_OTHER_THRESHOLD_PERCENTAGE,
    otherThresholdPercentage: threshold
});

export const setIsFetchingIndividualsCSV = (isFetching) => ({
    type: SET_IS_FETCHING_INDIVIDUALS_CSV,
    isFetchingIndividualCSV: isFetching
});
