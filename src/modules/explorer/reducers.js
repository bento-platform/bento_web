// https://github.com/eligrey/FileSaver.js/
import FileSaver from "file-saver";

import {
    addDataTypeFormIfPossible,
    removeDataTypeFormIfPossible,
    updateDataTypeFormIfPossible,
} from "../../utils/search";

import { readFromLocalStorage } from "../../utils/localStorageUtils";

import { DEFAULT_OTHER_THRESHOLD_PERCENTAGE } from "../../constants";

import {
    PERFORM_GET_GOHAN_VARIANTS_OVERVIEW,
    PERFORM_SEARCH,
    SET_IS_SUBMITTING_SEARCH,
    PERFORM_INDIVIDUAL_CSV_DOWNLOAD,
    PERFORM_BIOSAMPLE_CSV_DOWNLOAD,
    PERFORM_EXPERIMENT_CSV_DOWNLOAD,
    ADD_DATA_TYPE_QUERY_FORM,
    REMOVE_DATA_TYPE_QUERY_FORM,
    UPDATE_DATA_TYPE_QUERY_FORM,
    SET_SELECTED_ROWS,
    SET_TABLE_SORT_ORDER,
    SET_AUTO_QUERY_PAGE_TRANSITION,
    NEUTRALIZE_AUTO_QUERY_PAGE_TRANSITION,
    FREE_TEXT_SEARCH,
    SET_OTHER_THRESHOLD_PERCENTAGE,
    SET_IGV_POSITION,
} from "./actions";

// TODO: Could this somehow be combined with discovery?
export const explorer = (
    state = {
        variantsOverviewResponse: {},
        dataTypeFormsByDatasetID: {},
        fetchingSearchByDatasetID: {},
        searchResultsByDatasetID: {},
        selectedRowsByDatasetID: {},
        tableSortOrderByDatasetID: {},
        isFetchingDownload: false,
        fetchingTextSearch: false,
        isSubmittingSearch: false,

        autoQuery: {
            isAutoQuery: false,
        },
        otherThresholdPercentage:
            readFromLocalStorage("otherThresholdPercentage") ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE,
        igvPosition: undefined,
    },
    action
) => {
    switch (action.type) {
        case PERFORM_GET_GOHAN_VARIANTS_OVERVIEW.RECEIVE:
            return {
                ...state,
                variantsOverviewResponse: action.data,
            };
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
                        searchFormattedResultsExperiment: tableSearchResultsExperiments(action.data),
                        searchFormattedResultsBioSamples: tableSearchResultsBiosamples(action.data),
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

        case SET_IS_SUBMITTING_SEARCH:
            return {
                ...state,
                isSubmittingSearch: action.isSubmittingSearch,
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
        case PERFORM_BIOSAMPLE_CSV_DOWNLOAD.REQUEST:
            return {
                ...state,
                isFetchingDownload: true,
            };
        case PERFORM_BIOSAMPLE_CSV_DOWNLOAD.RECEIVE:
            FileSaver.saveAs(action.data, "biosamples.csv");

            return {
                ...state,
                isFetchingDownload: false,
            };
        case PERFORM_BIOSAMPLE_CSV_DOWNLOAD.FINISH:
            return {
                ...state,
                isFetchingDownload: false,
            };
        // ---

        case PERFORM_EXPERIMENT_CSV_DOWNLOAD.REQUEST:
            return {
                ...state,
                isFetchingDownload: true,
            };
        case PERFORM_EXPERIMENT_CSV_DOWNLOAD.RECEIVE:
            FileSaver.saveAs(action.data, "experiments.csv");

            return {
                ...state,
                isFetchingDownload: false,
            };
        case PERFORM_EXPERIMENT_CSV_DOWNLOAD.FINISH:
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
                        action.dataType
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
                        action.fields
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
                        action.dataType
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

        case SET_TABLE_SORT_ORDER:
            return {
                ...state,
                tableSortOrderByDatasetID: {
                    ...state.tableSortOrderByDatasetID,
                    [action.datasetID]: {
                        sortColumnKey: action.sortColumnKey,
                        sortOrder: action.sortOrder,
                    },
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
                },
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
                },
            };
        //.. and end here.. ----

        // free-text search
        case FREE_TEXT_SEARCH.REQUEST:
            return {
                ...state,
                fetchingTextSearch: true,
            };
        case FREE_TEXT_SEARCH.RECEIVE:
            return {
                ...state,
                searchResultsByDatasetID: {
                    ...state.searchResultsByDatasetID,
                    [action.datasetID]: {
                        results: freeTextResults(action.data),
                        searchFormattedResults: tableSearchResults(action.data),
                        searchFormattedResultsExperiments: tableSearchResultsExperiments(action.data),
                        searchFormattedResultsBiosamples: tableSearchResultsBiosamples(action.data),
                    },
                },
            };
        case FREE_TEXT_SEARCH.FINISH:
            return {
                ...state,
                fetchingTextSearch: false,
            };
        case SET_OTHER_THRESHOLD_PERCENTAGE:
            return {
                ...state,
                otherThresholdPercentage: action.otherThresholdPercentage,
            };
        case SET_IGV_POSITION:
            return {
                ...state,
                igvPosition: action.igvPosition,
            };

        default:
            return state;
    }
};

// helpers v1
/* const tableSearchResultsExperiments = (searchResults) => {
    console.log("searchResultstableSearchResultsExperiments", searchResults);
    const results = (searchResults || {}).results || [];

    return results.flatMap((result) => {
        if (!result.i_type) {
            return [];
        }

        return result.i_type.flatMap((expId, index) => {
            return {
                subject_id: result.subject_id,
                key: expId,
                alternate_ids: result.alternate_ids,
                i_type: result.i_type[index],
                im_type: expId,
                e_type: result.e_type[index],
                studies_type: result.studies_type[index],
                if_type: result.if_type[index],
                individual: {
                    id: result.subject_id,
                    alternate_ids: result.alternate_ids ?? [],
                },
            };
        });
    });
}; */

// helpers v2
const tableSearchResultsExperiments = (searchResults) => {
    const results = searchResults.results || [];

    return results.flatMap((result) => {
        console.log("Processing result:", result);
        if (!result.biosamples_with_experiments) {
            return [];
        }

        return result.biosamples_with_experiments.flatMap((sample) => {
            const experiment = sample.experiment;
            if (!experiment || experiment.experiment_id === null) {
                return [];
            }

            const formattedResult = {
                subject_id: result.subject_id,
                key: experiment.experiment_id,
                alternate_ids: result.alternate_ids,
                i_type: experiment.experiment_id,
                im_type: experiment.experiment_id,
                e_type: experiment.experiment_type,
                studies_type: experiment.study_type,
                if_type: sample.biosample_id,
                individual: {
                    id: result.subject_id,
                    alternate_ids: result.alternate_ids ?? [],
                },
            };

            return formattedResult;
        });
    });
};


// helpers v1
/* function generateObjectsBiosamples(searchResults) {
    const data = (searchResults || {}).results || [];
    return data.flatMap((result) => {
        if (!result.biosamples_with_experimentsM) {
            return [];
        }

        const biosampleIdToIndex = {};
        return result.biosamples_with_experimentsM.reduce((objects, biosampleId, i) => {
            if (biosampleId) {
                // only add object if key is truthy
                const index =
                    biosampleId in biosampleIdToIndex
                        ? biosampleIdToIndex[biosampleId]
                        : (biosampleIdToIndex[biosampleId] = objects.length);
                objects[index] = objects[index] || {
                    subject_id: result.subject_id,
                    key: biosampleId, // result.subject_id + "_" + biosampleId
                    alternate_ids: result.alternate_ids,
                    i_type: result.i_type[index] || "N/A",
                    im_type: biosampleId,
                    e_type: result.e_type[index] || "N/A",
                    if_type: result.if_type[index] || "N/A",
                    num_experiments: result.num_experiments,
                    individual: {
                        id: result.subject_id,
                        alternate_ids: result.alternate_ids || [],
                    },
                    experiments_id: [],
                    experiments_type: [],
                    studies_type: [],
                    sampled_tissues: [],
                };
                objects[index].experiments_id.push(result.experiments_id[i]);
                objects[index].experiments_type.push(result.experiments_type[i]);
                objects[index].studies_type.push(result.studies_type[i]);
                objects[index].sampled_tissues.push(result.sampled_tissues[i]);
            }
            return objects;
        }, []);
    });
} */

// helpers v2
/* function generateObjectsBiosamples(searchResults) {
    const data = (searchResults || {}).results || [];
    return data.flatMap((result) => {
        if (!result.biosamples_with_experiments) {
            return [];
        }

        return result.biosamples_with_experiments.map((biosample) => {
            return {
                subject_id: result.subject_id,
                key: biosample.biosample_id,
                alternate_ids: result.alternate_ids,
                i_type: biosample.experiment.experiment_id || "N/A",
                im_type: biosample.biosample_id,
                e_type: biosample.experiment.experiment_type || "N/A",
                if_type: biosample.biosample_id,
                num_experiments: result.num_experiments,
                individual: {
                    id: result.subject_id,
                    alternate_ids: result.alternate_ids || [],
                },
                experiments_id: [biosample.experiment.experiment_id],
                experiments_type: [biosample.experiment.experiment_type],
                studies_type: [biosample.experiment.study_type],
                sampled_tissues: [biosample.sampled_tissue],
            };
        });
    }).filter(entry => entry.key !== null && entry.key !== undefined);
} */
// helpers v2a
function generateObjectsBiosamples(searchResults) {
    const data = (searchResults || {}).results || [];
    return data.flatMap((result) => {
        if (!result.biosamples_with_experiments) {
            return [];
        }

        const biosampleIdToIndex = {};

        return result.biosamples_with_experiments.reduce((objects, biosample) => {
            const biosampleId = biosample.biosample_id;

            if (biosampleId) {
                const index =
                    biosampleId in biosampleIdToIndex
                        ? biosampleIdToIndex[biosampleId]
                        : (biosampleIdToIndex[biosampleId] = objects.length);
                objects[index] = objects[index] || {
                    subject_id: result.subject_id,
                    key: biosampleId,
                    alternate_ids: result.alternate_ids,
                    i_type: biosample.experiment.experiment_id || "N/A",
                    im_type: biosampleId,
                    e_type: biosample.experiment.experiment_type || "N/A",
                    if_type: biosampleId,
                    num_experiments: result.num_experiments,
                    individual: {
                        id: result.subject_id,
                        alternate_ids: result.alternate_ids || [],
                    },
                    experiments_id: [],
                    experiments_type: [],
                    studies_type: [],
                    sampled_tissues: [],
                };
                objects[index].experiments_id.push(biosample.experiment.experiment_id);
                objects[index].experiments_type.push(biosample.experiment.experiment_type);
                objects[index].studies_type.push(biosample.experiment.study_type);
                objects[index].sampled_tissues.push(biosample.sampled_tissue);
            }
            return objects;
        }, []);
    }).filter(entry => entry.key !== null && entry.key !== undefined);
}

const tableSearchResultsBiosamples = (searchResults) => {
    const res = generateObjectsBiosamples(searchResults);
    return res;
};

const tableSearchResults = (searchResults) => {
    const results = (searchResults || {}).results || [];

    return results.map((p) => {
        return {
            key: p.subject_id,
            individual: {
                id: p.subject_id,
                alternate_ids: p.alternate_ids ?? [],
            },
            biosamples: p.biosamples,
            experiments: p.num_experiments,
        };
    });
};

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
            variant: [], //TODO
        },
    };
}
