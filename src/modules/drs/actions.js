import {
    createNetworkActionTypes,
    networkAction,
} from "../../utils/actions";

import {message} from "antd";

export const PERFORM_SEARCH_BY_FUZZYNAME = createNetworkActionTypes("PERFORM_SEARCH_BY_FUZZYNAME");
export const PERFORM_OBJECT_DOWNLOAD = createNetworkActionTypes("PERFORM_OBJECT_DOWNLOAD");
export const RETRIEVE_DRS_VCF_URL = {
    SET: "RETRIEVE_DRS_VCF_URL.SET",
};

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
        const msg = `Something went wrong when pinging ${fuzzySearchUrl} ; fuzzySearchResponse is undefined`;
        console.error(msg);
        message.error(msg);
        return;
    }

    console.log(`Retrieved object for ${filename}`);

    const objId = fuzzySearchObj.find(obj => obj.name === filename)?.id;
    if (objId === undefined) {
        const msg = "Something went wrong when obtaining objId ; objId is undefined";
        console.error(msg);
        message.error(msg);
        return;
    }
    console.log(`Retrieved objectid ${objId} for ${filename}`);

        // - obtain object Id for the object with the same name
    const downloadUrl = `${getState().services.itemsByArtifact.drs.url}/objects/${objId}/download`;
    console.log(`Dispatching download from ${downloadUrl}`);
    dispatch(performDownloadFromDrs(downloadUrl, filename));
};

// single network call for file and index links
// handles vcfs only, can be parameterized for other file types
// todo, conslidate with above, remove code repitition
export const retrieveDrsUrlsForVcf = (filename) => async (dispatch, getState) => {
    console.log("initiating retrieveDrsUrlsForVcf");

    const indexSuffix = ".tbi";
    const indexFilename = filename + indexSuffix;
    const fuzzySearchUrl = `${getState().services.itemsByArtifact.drs.url}/search?fuzzy_name=${filename}`;

    await dispatch(performFuzzyNameSearch(fuzzySearchUrl));
    console.log(`Completed fuzzy search for ${filename}`);

    const fuzzySearchObj = getState().drs?.fuzzySearchResponse;
    if (fuzzySearchObj === undefined) {
        const msg = `Something went wrong when pinging ${fuzzySearchUrl} ; fuzzySearchResponse is undefined`;
        console.error(msg);
        message.error(msg);
        return;
    }

    const dataFileId = fuzzySearchObj.find(obj => obj.name === filename)?.id;
    if (dataFileId === undefined) {
        const msg = "Something went wrong when obtaining dataFile id";
        console.error(msg);
        message.error(msg);
        return;
    }

    const indexFileId = fuzzySearchObj.find(obj => obj.name === indexFilename)?.id;
    if (indexFileId === undefined) {
        const msg = "Something went wrong when obtaining index file id";
        console.error(msg);
        message.error(msg);
        return;
    }

    // construct correct urls
    const dataUrl = `${getState().services.itemsByArtifact.drs.url}/objects/${dataFileId}/download`;
    const indexUrl = `${getState().services.itemsByArtifact.drs.url}/objects/${indexFileId}/download`;
    const urls = {dataUrl: dataUrl, indexUrl: indexUrl};

    console.log(`retrieved vcf urls: ${JSON.stringify(urls)}`);

    await dispatch({
        type: RETRIEVE_DRS_VCF_URL.SET,
        filename: filename,
        urls: urls,
    });
};

const performFuzzyNameSearch = networkAction((fuzzySearchUrl) => () => ({
    types: PERFORM_SEARCH_BY_FUZZYNAME,
    url: fuzzySearchUrl,
    err: "Error performing fuzzy search on DRS",
}));

const performDownloadFromDrs = networkAction((downloadUrl, filename) => () => ({
    types: PERFORM_OBJECT_DOWNLOAD,
    url: downloadUrl,
    downloadedFilename: filename,
    parse: r => r.blob(),  // Parse the vcf as a binary blob rather than e.g. a JSON file
    err: "Error performing download from DRS",
}));

