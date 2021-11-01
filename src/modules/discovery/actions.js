import {
    conditionsToQuery,
    extractQueriesFromDataTypeForms,
    extractQueryConditionsFromFormValues
} from "../../utils/search";
import {createNetworkActionTypes, networkAction} from "../../utils/actions";
import {jsonRequest} from "../../utils/requests";


export const PERFORM_SEARCH = createNetworkActionTypes("DISCOVERY.PERFORM_SEARCH");
export const SELECT_SEARCH = "DISCOVERY.SELECT_SEARCH";

export const ADD_DATA_TYPE_QUERY_FORM = "DISCOVERY.ADD_DATA_TYPE_QUERY_FORM";
export const UPDATE_DATA_TYPE_QUERY_FORM = "DISCOVERY.UPDATE_DATA_TYPE_QUERY_FORM";
export const REMOVE_DATA_TYPE_QUERY_FORM = "DISCOVERY.REMOVE_DATA_TYPE_QUERY_FORM";
export const REMOVE_ALL_DATA_TYPE_QUERY_FORMS = "DISCOVERY.REMOVE_ALL_DATA_TYPE_QUERY_FORMS";

export const UPDATE_JOIN_QUERY_FORM = "DISCOVERY.UPDATE_JOIN_QUERY_FORM";

export const PERFORM_GOHAN_GENE_SEARCH = createNetworkActionTypes("GOHAN_GENE_SEARCH");

export const performGohanGeneSearchIfPossible = (searchTerm) => (dispatch, getState) => {
    const gohanUrl = getState()?.services?.gohan?.url
    const bentoBaseUrl = `${getState().nodeInfo.data.CHORD_URL}`
    const queryString = `/genes/search?term=${searchTerm}`
    const searchUrl = gohanUrl ? `${gohanUrl}${queryString}` : `${bentoBaseUrl}api/gohan${queryString}`
    dispatch(performGohanGeneSearch(searchUrl))
}

const performGohanGeneSearch = networkAction((searchUrl) => () => ({
    types: PERFORM_GOHAN_GENE_SEARCH,
    url: searchUrl,
    err: "error performing Gohan gene search",
}));

export const selectSearch = searchIndex => ({
    type: SELECT_SEARCH,
    searchIndex,
});

const performSearch = networkAction((dataTypeQueries, joinQuery = null) => (dispatch, getState) => ({
    types: PERFORM_SEARCH,
    url: `${getState().services.federationService.url}/federated-dataset-search`,
    req: jsonRequest({
        data_type_queries: dataTypeQueries,
        join_query: joinQuery
    }, "POST"),
    err: "Error performing search",
    onSuccess: () => dispatch(selectSearch(getState().discovery.searches.length - 1)),
}));


export const performFullSearchIfPossible = () => (dispatch, getState) => {
    if (getState().discovery.isFetching) return;

    // TODO: Map keys to avoid issues!!! Otherwise "deleted" conditions show up

    const dataTypeQueries = extractQueriesFromDataTypeForms(getState().discovery.dataTypeForms);
    if (dataTypeQueries.length === 0) return;  // TODO: Report this; blank data type query (should be caught earlier)

    const joinFormValues = getState().discovery.joinFormValues;
    const joinQueryConditions = extractQueryConditionsFromFormValues(joinFormValues);
    const joinQuery = joinQueryConditions.length > 0 ? conditionsToQuery(joinQueryConditions) : null;

    return dispatch(performSearch(dataTypeQueries, joinQuery));
};


export const addDataTypeQueryForm = dataType => ({
    type: ADD_DATA_TYPE_QUERY_FORM,
    dataType,
});

export const updateDataTypeQueryForm = (dataType, fields) => ({
    type: UPDATE_DATA_TYPE_QUERY_FORM,
    dataType,
    fields,
});

export const removeDataTypeQueryForm = dataType => ({
    type: REMOVE_DATA_TYPE_QUERY_FORM,
    dataType,
});

// export const removeAllDataTypeQueryForms = basicAction(REMOVE_ALL_DATA_TYPE_QUERY_FORMS);


// export const updateJoinQueryForm = fields => ({
//     type: UPDATE_JOIN_QUERY_FORM,
//     fields
// });
