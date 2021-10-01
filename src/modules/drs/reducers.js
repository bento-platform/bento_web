import FileSaver from "file-saver";

import { PERFORM_SEARCH_BY_FUZZYNAME, PERFORM_OBJECT_DOWNLOAD, RETRIEVE_URLS_FOR_IGV} from "./actions";

export const drs = (
    state = {
        isFuzzySearching: false,
        fuzzySearchResponse: {},
        isFetchingObjectForDownload: false,
        igvUrlsByFilename: {},
        isFetchingIgvUrls: false,
    },
    action
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

        case PERFORM_OBJECT_DOWNLOAD.REQUEST:
            return {
                ...state,
                isFetchingObjectForDownload: true,
            };
        case PERFORM_OBJECT_DOWNLOAD.RECEIVE:
            FileSaver.saveAs(action.data, action.downloadedFilename);
            //new Blob([data], {type: "application/octet-stream"})

            return {
                ...state,
                isFetchingObjectForDownload: false,
            };
        case PERFORM_OBJECT_DOWNLOAD.FINISH:
            return {
                ...state,
                isFetchingObjectForDownload: false,
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

        default:
            return state;
    }
};
