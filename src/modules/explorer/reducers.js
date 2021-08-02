// Credits:
// https://stackoverflow.com/questions/40377541/react-redux-download-file#42245216

import "file-saver"; // https://github.com/eligrey/FileSaver.js/
import FileSaver from "file-saver";
import {
    addDataTypeFormIfPossible,
    removeDataTypeFormIfPossible,
    updateDataTypeFormIfPossible
} from "../../utils/search";

import {
    PERFORM_SEARCH,
    PERFORM_INDIVIDUAL_CSV_DOWNLOAD,
    ADD_DATA_TYPE_QUERY_FORM,
    REMOVE_DATA_TYPE_QUERY_FORM,
    UPDATE_DATA_TYPE_QUERY_FORM,
    SET_SELECTED_ROWS,
    SET_AUTO_QUERY_PAGE_TRANSITION,
    NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION,
    FREE_TEXT_SEARCH

} from "./actions";

// TODO: Could this somehow be combined with discovery?
export const explorer = (
    state = {
        dataTypeFormsByDatasetID: {},
        fetchingSearchByDatasetID: {},
        searchResultsByDatasetID: {},
        selectedRowsByDatasetID: {},
        isFetchingDownload: false,

        autoQuery: {
            isAutoQuery: false
        }
    },
    action
) => {
    switch (action.type) {
        case PERFORM_SEARCH.REQUEST:
            return {
                ...state,
                fetchingSearchByDatasetID: {
                    ...state.fetchingSearchByDatasetID,
                    [action.datasetID]: true,
                },
            };
        case PERFORM_SEARCH.RECEIVE:
            return {
                ...state,
                searchResultsByDatasetID: {
                    ...state.searchResultsByDatasetID,
                    [action.datasetID]: {
                        results: action.data,
                        searchFormattedResults: tableSearchResults(action.data),
                    },
                },
                selectedRowsByDatasetID: {
                    ...state.selectedRowsByDatasetID,
                    [action.datasetID]: [],
                },
            };
        case PERFORM_SEARCH.FINISH:
            return {
                ...state,
                fetchingSearchByDatasetID: {
                    ...state.fetchingSearchByDatasetID,
                    [action.datasetID]: false,
                },
            };

        case PERFORM_INDIVIDUAL_CSV_DOWNLOAD.REQUEST:
            return {
                ...state,
                isFetchingDownload: true,
            };
        case PERFORM_INDIVIDUAL_CSV_DOWNLOAD.RECEIVE:
            FileSaver.saveAs(action.data, "data.csv"); //new Blob([data], {type: "application/octet-stream"})

            return {
                ...state,
                isFetchingDownload: false,
            };
        case PERFORM_INDIVIDUAL_CSV_DOWNLOAD.FINISH:
            return {
                ...state,
                isFetchingDownload: false,
            };
        // ---

        case ADD_DATA_TYPE_QUERY_FORM:
            return {
                ...state,
                dataTypeFormsByDatasetID: {
                    ...state.dataTypeFormsByDatasetID,
                    [action.datasetID]: addDataTypeFormIfPossible(
                        state.dataTypeFormsByDatasetID[action.datasetID] || [],
                        action.dataType,
                    ),
                },
            };
        case UPDATE_DATA_TYPE_QUERY_FORM:
            return {
                ...state,
                dataTypeFormsByDatasetID: {
                    ...state.dataTypeFormsByDatasetID,
                    [action.datasetID]: updateDataTypeFormIfPossible(
                        state.dataTypeFormsByDatasetID[action.datasetID] || [],
                        action.dataType,
                        action.fields,
                    ),
                },
            };
        case REMOVE_DATA_TYPE_QUERY_FORM:
            return {
                ...state,
                dataTypeFormsByDatasetID: {
                    ...state.dataTypeFormsByDatasetID,
                    [action.datasetID]: removeDataTypeFormIfPossible(
                        state.dataTypeFormsByDatasetID[action.datasetID] || [],
                        action.dataType,
                    ),
                },
            };

        case SET_SELECTED_ROWS:
            return {
                ...state,
                selectedRowsByDatasetID: {
                    ...state.selectedRowsByDatasetID,
                    [action.datasetID]: action.selectedRows,
                },
            };

        // Auto-Queries start here ----
        case SET_AUTO_QUERY_PAGE_TRANSITION:
            return {
                ...state,
                autoQuery: {
                    isAutoQuery: true,
                    pageUrlBeforeAutoQuery: action.pageUrlBeforeAutoQuery,
                    autoQueryType: action.autoQueryType,
                    autoQueryField: action.autoQueryField,
                    autoQueryValue: action.autoQueryValue,
                }
            };

        case NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION:
            return {
                ...state,
                autoQuery: {
                    isAutoQuery: false,
                    pageUrlBeforeAutoQuery: undefined,
                    autoQueryType: undefined,
                    autoQueryField: undefined,
                    autoQueryValue: undefined,
                }
            };
        //.. and end here.. ----

        // free-text search
        case FREE_TEXT_SEARCH.REQUEST:
            return {
                ...state,
                fetchingSearchByDatasetID: {
                    ...state.fetchingSearchByDatasetID,
                    [action.datasetID]: true,
                },
            };
        case FREE_TEXT_SEARCH.RECEIVE:
            return {
                ...state,
                searchResultsByDatasetID: {
                    ...state.searchResultsByDatasetID,
                    [action.datasetID]: {
                        results: freeTextResults(action.data),
                        searchFormattedResults: freeTextSearchFormattedResults(action.data.results),
                    },
                },
            };
        case FREE_TEXT_SEARCH.FINISH:
            return {
                ...state,
                fetchingSearchByDatasetID: {
                    ...state.fetchingSearchByDatasetID,
                    [action.datasetID]: false,
                },
            };

        default:
            return state;
    }
};

// helpers
function tableSearchResults(searchResults) {
    const results = (searchResults || {}).results || {};
    const tableResultSet = {};

    (results.phenopacket || []).forEach(p => {
        const individualID = p.subject.id;
        if (!tableResultSet.hasOwnProperty(individualID)) {
            tableResultSet[individualID] = {
                key: individualID,
                individual: p.subject,
                biosamples: {},  // Only includes biosamples from the phenopackets that matched the search query.
                diseases: {},  // Only includes diseases from "
                phenotypic_features: {},
                experiments: [],  // TODO
            };
        }

        (p.biosamples || []).forEach(b => tableResultSet[individualID].biosamples[b.id] = b);
        (p.diseases || []).forEach(d => tableResultSet[individualID].diseases[d.id] = d);
        (p.phenotypic_features || []).forEach(pf => tableResultSet[individualID].phenotypic_features[pf.type.id] = pf);
    });

    return Object.values(tableResultSet).map(i => ({
        ...i,
        biosamples: Object.values(i.biosamples).sort((b1, b2) => b1.id.localeCompare(b2.id)),
        diseases: Object.values(i.diseases).sort(
            (d1, d2) => d1.id.toString().localeCompare(d2.id.toString())),
        phenotypic_features: Object.values(i.phenotypic_features).sort(
            (pf1, pf2) => pf1.type.id.localeCompare(pf2.type.id))
    }));
}


// free-text search helpers

// several components expect results in this format:
// {results: {...}, searchFormattedResults: {...} }
// but free-text results are not in the same format as regular queries,
// so need their own formatting functions
function freeTextResults(_searchResults) {

    // TODO:
    // most information expected here is missing in free-text search response
    // can be added in a future katsu version
    // but all that information is ignored by bento_web except variants info, so just return that

    return {
        results: {
            variant: []   //TODO
        }
    };
}

// produces searchFormattedResults (input for results table and other components)
// free-text equivalent to tableSearchResults() above
function freeTextSearchFormattedResults(searchResults) {
    console.log({RESULTS_FORMATTED_RESULTS_FORMATTER: searchResults});

    return searchResults.map( r => {
        return {
            key: r.id,
            biosamples: r.biosamples,
            diseases: r.phenopackets[0].diseases,  //TO FIX, multiple phenopackets possible
            experiments: [], //TODO
            phenotypic_features: r.phenopackets[0].phenotypic_features, //TO FIX, as above
            individual: {
                age: r.age,
                created: r.created,
                date_of_birth: r.date_of_birth,
                id: r.id,
                karotypic_sex: r.karotypic_sex,
                taxonomy: r.taxonomy,
                upated: r.updated
            }
        };
    });
}
