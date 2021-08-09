import {
    createNetworkActionTypes,
    networkAction,
} from "../../utils/actions";

export const PERFORM_SEARCH_BY_FUZZYNAME = createNetworkActionTypes("PERFORM_SEARCH_BY_FUZZYNAME");
export const PERFORM_OBJECT_DOWNLOAD = createNetworkActionTypes("PERFORM_OBJECT_DOWNLOAD");

export const performDownloadFromDrsIfPossible = (filename) => async (dispatch, getState) => {
    console.log("Initiating performIndividualsDownloadFromDrsIfPossible");

        // determine drs search url
    const fuzzySearchUrl = `${getState().services.itemsByArtifact.drs.url}/search?fuzzy_name=${filename}`;

        // call drs to get the download link
        // - fuzzy_name search for filename
    await dispatch(performFuzzyNameSearch(fuzzySearchUrl));

    console.log(`Completed fuzzy search for ${filename}`);

        // determine drs download url
    const fuzzySearchObj = getState().drs?.fuzzySearchResponse;
    if (fuzzySearchObj === undefined) {
        console.error(`Something went wrong when pinging ${fuzzySearchUrl} ; fuzzySearchResponse is undefined`);
        return;
    }

    console.log(`Retrieved object for ${filename}`);

    const objId = fuzzySearchObj.find(obj => obj.name === filename)?.id;
    if (objId === undefined) {
        console.error("Something went wrong when obtaining objId ; objId is undefined");
        return;
    }
    console.log(`Retrieved objectid ${objId} for ${filename}`);

        // - obtain object Id for the object with the same name
    const downloadUrl = `${getState().services.itemsByArtifact.drs.url}/objects/${objId}/download`;
    console.log(`Dispatching download from ${downloadUrl}`);
    dispatch(performDownloadFromDrs(downloadUrl));
};

const performFuzzyNameSearch = networkAction((fuzzySearchUrl) => () => ({
    types: PERFORM_SEARCH_BY_FUZZYNAME,
    url: fuzzySearchUrl,
    err: "Error performing fuzzy search on DRS",
}));

const performDownloadFromDrs = networkAction((downloadUrl) => () => ({
    types: PERFORM_OBJECT_DOWNLOAD,
    url: downloadUrl,
    parse: r => r.blob(),  // Parse the vcf as a binary blob rather than e.g. a JSON file
    err: "Error performing download from DRS",
}));
