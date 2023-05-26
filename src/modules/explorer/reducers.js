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
        fetchingVariantsOverview: false,
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
    action,
) => {
    switch (action.type) {
        case PERFORM_GET_GOHAN_VARIANTS_OVERVIEW.RECEIVE:
            return {
                ...state,
                variantsOverviewResponse: action.data,
            };
        case PERFORM_GET_GOHAN_VARIANTS_OVERVIEW.REQUEST:
            return {
                ...state,
                fetchingVariantsOverview: true,
            };
        case PERFORM_GET_GOHAN_VARIANTS_OVERVIEW.FINISH:
            return {
                ...state,
                fetchingVariantsOverview: false,
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
                        searchFormattedResultsBiosamples: generateBiosampleObjects(action.data),
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
                        searchFormattedResultsBiosamples: generateBiosampleObjects(action.data),
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

// helpers
const tableSearchResultsExperiments = (searchResults) => {
    const results = searchResults.results || [];

    return results.flatMap((result) => {
        if (!result.experiments_with_biosamples) {
            return [];
        }

        return result.experiments_with_biosamples.flatMap((sample) => {
            const experiment = sample.experiment;
            if (!experiment || experiment.experiment_id === null) {
                return [];
            }

            const formattedResult = {
                subjectId: result.subject_id,
                key: experiment.experiment_id,
                alternateIds: result.alternate_ids,
                experimentId: experiment.experiment_id,
                experimentType: experiment.experiment_type,
                studyType: experiment.study_type,
                biosampleId: sample.biosample_id,
                individual: {
                    id: result.subject_id,
                    alternate_ids: result.alternate_ids ?? [],
                },
            };

            return formattedResult;
        });
    });
};

function generateBiosampleObjects(searchResults) {
    return (searchResults?.results ?? [])
        .flatMap((result) => {
            if (!result["experiments_with_biosamples"]) {
                return [];
            }

            const biosampleIdToIndex = {};

            return result["experiments_with_biosamples"].reduce((objects, biosample) => {
                const biosampleId = biosample["biosample_id"];

                if (biosampleId) {
                    const index =
                        biosampleId in biosampleIdToIndex
                            ? biosampleIdToIndex[biosampleId]
                            : (biosampleIdToIndex[biosampleId] = objects.length);

                    objects[index] = objects[index] || {
                        subjectId: result["subject_id"],
                        key: biosampleId,
                        biosample: biosampleId,
                        alternateIds: result["alternate_ids"],
                        individual: {
                            id: result["subject_id"],
                            alternateIds: result["alternate_ids"] || [],
                        },
                        experimentIds: [],
                        experimentTypes: [],
                        studyTypes: [],
                        sampledTissues: [],
                    };
                    objects[index].experimentIds.push(biosample.experiment["experiment_id"]);
                    objects[index].experimentTypes.push(biosample.experiment["experiment_type"]);
                    objects[index].studyTypes.push(biosample.experiment["study_type"]);
                    objects[index].sampledTissues.push(biosample["sampled_tissue"]);
                }
                return objects;
            }, []);
        })
        .filter((entry) => entry.key !== null && entry.key !== undefined);
}

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
