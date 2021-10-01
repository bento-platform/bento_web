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

export const RETRIEVE_URLS_FOR_IGV = {
    BEGIN: "RETRIEVE_URLS_FOR_IGV.BEGIN",
    END: "RETRIEVE_URLS_FOR_IGV.END",
    ERROR: "RETRIEVE_URLS_FOR_IGV.ERROR",
};

const getDrsUrl = (filename) => async (dispatch, getState) => {
    console.log("Initiating getDrsUrl");

    const fuzzySearchUrl = `${getState().services.itemsByArtifact.drs.url}/search?fuzzy_name=${filename}`;
    await dispatch(performFuzzyNameSearch(fuzzySearchUrl));

    console.log(`Completed fuzzy search for ${filename}`);

    // determine drs url
    const fuzzySearchObj = getState().drs?.fuzzySearchResponse;
    if (fuzzySearchObj === undefined) {
        const msg = `Something went wrong when pinging ${fuzzySearchUrl} ; fuzzySearchResponse is undefined`;
        console.error(msg);
        message.error(msg);
        return null;
    }

    console.log(`Retrieved object for ${filename}`);

    const objId = fuzzySearchObj.find(obj => obj.name === filename)?.id;
    if (objId === undefined) {
        const msg = "Something went wrong when obtaining objId ; objId is undefined";
        console.error(msg);
        message.error(msg);
        return null;
    }
    console.log(`Retrieved objectid ${objId} for ${filename}`);

    const accessUrl = `${getState().services.itemsByArtifact.drs.url}/objects/${objId}/download`;

    console.log(`retrieved url: ${accessUrl}`);

    return {[filename]: accessUrl};
};

// for igv-viewable files, get data and index file urls in a single network call
const getDrsDataAndIndexUrls = (filename) => async (dispatch, getState) => {
    console.log("Initiating getDrsDataAndIndexUrls");

    const indexFilename = indexFileName(filename);
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

    const dataFileId = fuzzySearchObj.find((obj) => obj.name === filename)?.id;
    if (dataFileId === undefined) {
        const msg = "Something went wrong when obtaining dataFile id";
        console.error(msg);
        message.error(msg);
        return;
    }

    const indexFileId = fuzzySearchObj.find((obj) => obj.name === indexFilename)?.id;
    if (indexFileId === undefined) {
        const msg = "Something went wrong when obtaining index file id";
        console.error(msg);
        message.error(msg);
        return;
    }

  // construct correct urls
    const dataUrl = `${getState().services.itemsByArtifact.drs.url}/objects/${dataFileId}/download`;
    const indexUrl = `${getState().services.itemsByArtifact.drs.url}/objects/${indexFileId}/download`;
    const urls = { [filename]: { dataUrl: dataUrl, indexUrl: indexUrl } };

    console.log(`retrieved urls: ${JSON.stringify(urls)}`);

    return urls;
};

export const performDownloadFromDrsIfPossible = (filename) => async (dispatch, _getState) => {
    console.log("Initiating new performIndividualsDownloadFromDrsIfPossible");

    const accessUrl = await(dispatch(getDrsUrl(filename)));
    if (accessUrl === null) {
        console.log(`error retrieving url for file ${filename}`);
    // todo: dispatch error
        return;
    }

    dispatch(performDownloadFromDrs(accessUrl, filename));
};


export const getIgvUrlsFromDrs = (filenames) => async (dispatch, _getState) => {
    console.log("initiating getIgvUrlsFromDrs");
    const searchesToDispatch = filenames.map((f) =>
        isIndexedFileType(f) ? dispatch(getDrsDataAndIndexUrls(f)) : dispatch(getDrsUrl(f))
    );

    dispatch(beginIgvUrlSearch());

    await Promise.all(searchesToDispatch)
        .then((urls) => {
      // reduce array to object that's addressable by filename
            const urlsObj = urls.reduce((obj, item) => Object.assign(obj, item), {});

            console.log(`received drs urls for igv: ${urlsObj}`);

            dispatch(setDrsUrlsForIgv(urlsObj));
        })
        .catch((err) => {
            console.log(err);
            dispatch(errorIgvUrlSearch());
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

const beginIgvUrlSearch = () => ({
    type: RETRIEVE_URLS_FOR_IGV.BEGIN,
});

const setDrsUrlsForIgv = (urls) => ({
    type: RETRIEVE_URLS_FOR_IGV.END,
    urls: urls
});

const errorIgvUrlSearch = () => ({
    type: RETRIEVE_URLS_FOR_IGV.ERROR,
  // err: 'error retrieving DRS urls for IGV'
});


// filename convention helpers
// TODO: make DRS associate data files and index files, so we don't need filename conventions

const isIndexedFileType = (filename) => hasIndex(guessFileType(filename));
const indexFileName = (filename) => filename + indexSuffix[guessFileType(filename)];

// expand here for more filetypes
const guessFileType = (filename) => {
    if (filename.toLowerCase().endsWith(".vcf.gz")) {
        return ("vcf");
    }
    if (filename.toLowerCase().endsWith(".cram")) {
        return ("cram");
    }
    if (filename.toLowerCase().endsWith(".bw") || filename.toLowerCase().endsWith(".bigwig")) {
        return "bigWig";
    }
    return null;
};

const indexSuffix = {
    "vcf": ".tbi",
    "cram": ".crai"
};

const hasIndex = (fileType) => {
    switch (fileType) {
        case "vcf":
        case "cram":
            return true;

        default:
            return false
            ;
    }
};
