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
    NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION
} from "./actions";

const tableSearchResults = (searchResults) => {
    const results = (searchResults || {}).results || {};
    const tableResultSet = {};

    // Collect all experiments (which have a biosample, not necessarily unique
    // - one can perform multiple experiments on the same biosample) in arrays
    // by their biosample ID.
    const experimentsByBiosample = {};
    (results.experiment ?? []).forEach(experiment => {
        const biosampleID = experiment.biosample;
        if (!experimentsByBiosample.hasOwnProperty(biosampleID)) {
            experimentsByBiosample[biosampleID] = [];
        }
        experimentsByBiosample[biosampleID].push(experiment);
    });

    // First, collect different data from phenopackets and sort them into an object for an individual
    (results.phenopacket || []).forEach(p => {
        const individualID = p.subject.id;
        if (!tableResultSet.hasOwnProperty(individualID)) {
            // We DO NOT initialize diseases, PFs, experiments etc. here because we may have
            // multiple phenopackets on the same individual, and we want to combine this
            // into one record for the individual. It gets populated separately below.
            tableResultSet[individualID] = {
                key: individualID,
                individual: p.subject,
                biosamples: {},  // Only includes biosamples from the phenopackets that matched the search query.
                diseases: {},  // Only includes diseases from "
                phenotypic_features: {},
                experiments: {},  // Filled from all the experiments conducted on the biosamples
            };
        }

        // Accumulate biosamples based on individual ID and experiments by that biosample
        // ID, de-duplicating in the process to event overlap if multiple phenopackets
        // have the same biosample(s) or something weird.
        (p.biosamples ?? []).forEach(b => {
            tableResultSet[individualID].biosamples[b.id] = b;
            (experimentsByBiosample[b.id] ?? []).forEach(e => tableResultSet[individualID].experiments[e.id] = e);
        });

        // Accumulate diseases and phenotypic features in the same manner.
        (p.diseases ?? []).forEach(d => tableResultSet[individualID].diseases[d.id] = d);
        (p.phenotypic_features ?? []).forEach(pf => tableResultSet[individualID].phenotypic_features[pf.type.id] = pf);
    });

    // Now that the biosamples/diseases/PFs/experiments are de-duplicated, turn
    // them into arrays and sort them in a consistent manner. Also flatten the
    // stuff-by-individual object into a sorted array.
    return Object.values(tableResultSet).map(i => ({
        ...i,
        biosamples: Object.values(i.biosamples).sort((b1, b2) => b1.id.localeCompare(b2.id)),
        diseases: Object.values(i.diseases).sort(
            (d1, d2) => d1.id.toString().localeCompare(d2.id.toString())),
        phenotypic_features: Object.values(i.phenotypic_features).sort(
            (pf1, pf2) => pf1.type.id.localeCompare(pf2.type.id)),
        experiments: Object.values(i.experiments).sort(
            (e1, e2) => e1.id.toString().localeCompare(e2.id.toString())),
    })).sort((i1, i2) => i1.key.localeCompare(i2.key));
};

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

        default:
            return state;
    }
};
