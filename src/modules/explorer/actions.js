import {createNetworkActionTypes, networkAction} from "../../utils/actions";
import {jsonRequest} from "../../utils/requests";
import {extractQueriesFromDataTypeForms} from "../../utils/search";

export const PERFORM_SEARCH = createNetworkActionTypes("EXPLORER.PERFORM_SEARCH");
export const PERFORM_INDIVIDUAL_CSV_DOWNLOAD = createNetworkActionTypes("EXPLORER.PERFORM_INDIVIDUAL_CSV_DOWNLOAD");

export const ADD_DATA_TYPE_QUERY_FORM = "EXPLORER.ADD_DATA_TYPE_QUERY_FORM";
export const UPDATE_DATA_TYPE_QUERY_FORM = "EXPLORER.UPDATE_DATA_TYPE_QUERY_FORM";
export const REMOVE_DATA_TYPE_QUERY_FORM = "EXPLORER.REMOVE_DATA_TYPE_QUERY_FORM";

export const SET_SELECTED_ROWS = "EXPLORER.SET_SELECTED_ROWS";

export const SET_AUTO_QUERY_PAGE_TRANSITION = "EXPLORER.SET_AUTO_QUERY_PAGE_TRANSITION";

export const NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION = "EXPLORER.NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION";

const performSearch = networkAction((datasetID, dataTypeQueries) => (dispatch, getState) => ({
    types: PERFORM_SEARCH,
    url: `${getState().services.federationService.url}/private/dataset-search/${datasetID}`,
    params: {datasetID},
    req: jsonRequest({
        data_type_queries: dataTypeQueries,
        join_query: null  // Will get auto-filled by the federation service
    }, "POST"),
    err: "Error performing search",
}));

const performIndividualCSVDownload = networkAction((individualsUrl) => () => ({
    types: PERFORM_INDIVIDUAL_CSV_DOWNLOAD,
    url: `${individualsUrl}`,
    parse: r => r.blob(),  // Parse the CSV as a binary blob rather than e.g. a JSON file
    err: "Error performing individual csv download",
}));

export const performSearchIfPossible = (datasetID) => (dispatch, getState) => {
    if (getState().explorer.fetchingSearchByDatasetID[datasetID]) return;

    const dataTypeQueries = extractQueriesFromDataTypeForms(getState().explorer.dataTypeFormsByDatasetID[datasetID]);

    // TODO: What to do if phenopacket data type not present?
    // Must include phenopacket/experiment query so we can include the data in the results
    if (!dataTypeQueries.hasOwnProperty("phenopacket")) dataTypeQueries["phenopacket"] = true;
    if (!dataTypeQueries.hasOwnProperty("experiment")) dataTypeQueries["experiment"] = true;

    return dispatch(performSearch(datasetID, dataTypeQueries));
};

export const performIndividualsDownloadCSVIfPossible = (datasetId, individualIds, allSearchResults) =>
    (dispatch, getState) => {
        console.log("Initiating PerformIndividualsDownloadCSVIfPossible");

        let dataUrl = `${getState().services.itemsByArtifact.metadata.url}/api/individuals?format=csv`;

        // build query string
        // TODO: This should use the actual JS API for URL construction
        if (individualIds.length > 0) { // Get only selected results
            dataUrl += ("&page_size=" + individualIds.length);
            individualIds.forEach(id => dataUrl += `&id=${id}`);
        } else { // Get all search results
            dataUrl += ("&page_size=" + allSearchResults.length);
            allSearchResults.forEach(sr => dataUrl += `&id=${sr.key}`);
        }

        return dispatch(performIndividualCSVDownload(dataUrl));
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
