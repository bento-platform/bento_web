import { PERFORM_SEARCH_BY_FUZZYNAME, RETRIEVE_URLS_FOR_IGV, RETRIEVE_URLS_FOR_DOWNLOAD} from "./actions";

export const drs = (
    state = {
        isFuzzySearching: false,
        fuzzySearchResponse: {},
        igvUrlsByFilename: {},
        isFetchingIgvUrls: false,
        downloadUrlsByFilename: {},
        isFetchingDownloadUrls: false,
    },
    action,
) => {
    switch (action.type) {
        case PERFORM_SEARCH_BY_FUZZYNAME.REQUEST:
            return {
                ...state,
                isFuzzySearching: true,
            };
        case PERFORM_SEARCH_BY_FUZZYNAME.RECEIVE:
            return {
                ...state,
                isFuzzySearching: false,
                fuzzySearchResponse: action.data,
            };
        case PERFORM_SEARCH_BY_FUZZYNAME.FINISH:
            return {
                ...state,
                isFuzzySearching: false,
            };

        case RETRIEVE_URLS_FOR_IGV.BEGIN:
            return {
                ...state,
                isFetchingIgvUrls: true,
            };

        case RETRIEVE_URLS_FOR_IGV.END:
            return {
                ...state,
                isFetchingIgvUrls: false,
                igvUrlsByFilename: action.urls,
            };

        case RETRIEVE_URLS_FOR_IGV.ERROR:
            return {
                ...state,
                isFetchingIgvUrls: false,
            };

        case RETRIEVE_URLS_FOR_DOWNLOAD.BEGIN:
            return {
                ...state,
                isFetchingDownloadUrls: true,
            };

        case RETRIEVE_URLS_FOR_DOWNLOAD.END:
            return {
                ...state,
                isFetchingDownloadUrls: false,
                downloadUrlsByFilename: action.urls,
            };

        case RETRIEVE_URLS_FOR_DOWNLOAD.ERROR:
            return {
                ...state,
                isFetchingDownloadUrls: false,
            };

        default:
            return state;
    }
};
