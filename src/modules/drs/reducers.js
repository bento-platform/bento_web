import FileSaver from "file-saver";

import {
    PERFORM_SEARCH_BY_FUZZYNAME,
    PERFORM_OBJECT_DOWNLOAD,
} from "./actions";



export const drs = (
    state = {
        isFuzzySearching: false,
        fuzzySearchResponse: {},
        isFetchingObjectForDownload: false
    },
    action
) => {
    switch (action.type) {
        case PERFORM_SEARCH_BY_FUZZYNAME.REQUEST:
            return {
                ...state,
                isFuzzySearching: true
            };
        case PERFORM_SEARCH_BY_FUZZYNAME.RECEIVE:
            return {
                ...state,
                isFuzzySearching: false,
                fuzzySearchResponse: action.data
            };
        case PERFORM_SEARCH_BY_FUZZYNAME.FINISH:
            return {
                ...state,
                isFuzzySearching: false
            };


        case PERFORM_OBJECT_DOWNLOAD.REQUEST:
            return {
                ...state,
                isFetchingObjectForDownload: true
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

        default:
            return state;
    }
};
