import FileSaver from "file-saver";

import { PERFORM_SEARCH_BY_FUZZYNAME, PERFORM_OBJECT_DOWNLOAD, RETRIEVE_DRS_VCF_URL} from "./actions";

export const drs = (
    state = {
        isFuzzySearching: false,
        fuzzySearchResponse: {},
        isFetchingObjectForDownload: false,
        vcfUrlsByFilename: {},
        hasSetVcfUrls: false
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

        case RETRIEVE_DRS_VCF_URL.SET:
            return {
                ...state,
                vcfUrlsByFilename: {
                    ...state.vcfUrlsByFilename,
                    [action.filename]: action.urls,
                },
                hasSetVcfUrls: true,
            };

        default:
            return state;
    }
};
