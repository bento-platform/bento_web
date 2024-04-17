import {
    PERFORM_SEARCH_BY_FUZZY_NAME,
    RETRIEVE_URLS_FOR_IGV,
    RETRIEVE_URLS_FOR_DOWNLOAD,
    PERFORM_DRS_OBJECT_SEARCH,
    DELETE_DRS_OBJECT, CLEAR_DRS_OBJECT_SEARCH,
} from "./actions";

export const drs = (
    state = {
        isFuzzySearching: false,
        fuzzySearchResponse: {},
        igvUrlsByFilename: {},
        isFetchingIgvUrls: false,
        downloadUrlsByFilename: {},
        isFetchingDownloadUrls: false,

        objectSearchResults: [],
        objectSearchIsFetching: false,
        objectSearchAttempted: false,

        isDeleting: false,
    },
    action,
) => {
    switch (action.type) {
        // PERFORM_SEARCH_BY_FUZZY_NAME
        case PERFORM_SEARCH_BY_FUZZY_NAME.REQUEST:
            return { ...state, isFuzzySearching: true };
        case PERFORM_SEARCH_BY_FUZZY_NAME.RECEIVE:
            return { ...state, fuzzySearchResponse: action.data };
        case PERFORM_SEARCH_BY_FUZZY_NAME.FINISH:
            return { ...state, isFuzzySearching: false };

        // RETRIEVE_URLS_FOR_IGV
        case RETRIEVE_URLS_FOR_IGV.BEGIN:
            return { ...state, isFetchingIgvUrls: true };
        case RETRIEVE_URLS_FOR_IGV.END:
            return { ...state, isFetchingIgvUrls: false, igvUrlsByFilename: action.urls };
        case RETRIEVE_URLS_FOR_IGV.ERROR:
            return { ...state, isFetchingIgvUrls: false };

        // RETRIEVE_URLS_FOR_DOWNLOAD
        case RETRIEVE_URLS_FOR_DOWNLOAD.BEGIN:
            return { ...state, isFetchingDownloadUrls: true };
        case RETRIEVE_URLS_FOR_DOWNLOAD.END:
            return { ...state, isFetchingDownloadUrls: false, downloadUrlsByFilename: action.urls };
        case RETRIEVE_URLS_FOR_DOWNLOAD.ERROR:
            return { ...state, isFetchingDownloadUrls: false };

        // PERFORM_DRS_OBJECT_SEARCH
        case PERFORM_DRS_OBJECT_SEARCH.REQUEST:
            return { ...state, objectSearchIsFetching: true };
        case PERFORM_DRS_OBJECT_SEARCH.RECEIVE:
            return { ...state, objectSearchResults: action.data };
        case PERFORM_DRS_OBJECT_SEARCH.FINISH:
            return { ...state, objectSearchIsFetching: false, objectSearchAttempted: true };

        // CLEAR_DRS_OBJECT_SEARCH
        case CLEAR_DRS_OBJECT_SEARCH:
            return { ...state, objectSearchResults: [], objectSearchAttempted: false };

        // DELETE_DRS_OBJECT
        case DELETE_DRS_OBJECT.REQUEST:
            return { ...state, isDeleting: true };
        case DELETE_DRS_OBJECT.RECEIVE:
            return {
                ...state,
                objectSearchResults: state.objectSearchResults.filter((o) => o.id !== action.drsObject.id),
            };
        case DELETE_DRS_OBJECT.FINISH:
            return { ...state, isDeleting: false };

        default:
            return state;
    }
};
