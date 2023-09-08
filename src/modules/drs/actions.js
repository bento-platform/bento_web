import {
    createNetworkActionTypes,
    networkAction,
} from "../../utils/actions";
import { guessFileType } from "../../utils/guessFileType";
import {message} from "antd";

export const PERFORM_SEARCH_BY_FUZZYNAME = createNetworkActionTypes("PERFORM_SEARCH_BY_FUZZYNAME");

export const RETRIEVE_DRS_VCF_URL = {
    SET: "RETRIEVE_DRS_VCF_URL.SET",
};

export const RETRIEVE_URLS_FOR_IGV = {
    BEGIN: "RETRIEVE_URLS_FOR_IGV.BEGIN",
    END: "RETRIEVE_URLS_FOR_IGV.END",
    ERROR: "RETRIEVE_URLS_FOR_IGV.ERROR",
};

export const RETRIEVE_URLS_FOR_DOWNLOAD = {
    BEGIN: "RETRIEVE_URLS_FOR_DOWNLOAD.BEGIN",
    END: "RETRIEVE_URLS_FOR_DOWNLOAD.END",
    ERROR: "RETRIEVE_URLS_FOR_DOWNLOAD.ERROR",
};

const getDrsUrl = (filename) => async (dispatch, getState) => {
    const drsUrl = getState().services.drsService.url;

    console.log("Initiating getDrsUrl");

    const fuzzySearchUrl = `${drsUrl}/search?fuzzy_name=${filename}`;
    await dispatch(performFuzzyNameSearch(fuzzySearchUrl));

    console.log(`Completed fuzzy search for ${filename}`);

    // determine drs url
    const fuzzySearchObj = getState()?.drs?.fuzzySearchResponse;
    if (fuzzySearchObj === undefined) {
        const msg = `Something went wrong when pinging ${fuzzySearchUrl} ; fuzzySearchResponse is undefined`;
        console.error(msg);
        message.error(msg);
        return {[filename]: null};
    }

    console.log(`Retrieved object for ${filename}`);
    console.log({fuzzySearchObj: fuzzySearchObj});

    const objId = fuzzySearchObj.find(obj => obj.name === filename)?.id;
    if (objId === undefined) {
        // console notification only, file not present is not always an error
        console.error(`${filename}: file not found in drs`);
        return {[filename]: null};
    }
    console.log(`Retrieved objectid ${objId} for ${filename}`);

    const accessUrl = `${drsUrl}/objects/${objId}/download`;
    return {[filename]: {url: accessUrl}};
};

// for igv-viewable files, get data and index file urls in a single network call
const getDrsDataAndIndexUrls = (filename) => async (dispatch, getState) => {
    const drsUrl = getState().services.drsService.url;

    console.log("Initiating getDrsDataAndIndexUrls");

    const indexFilename = indexFileName(filename);
    const fuzzySearchUrl = `${drsUrl}/search?fuzzy_name=${filename}`;
    await dispatch(performFuzzyNameSearch(fuzzySearchUrl));
    console.log(`Completed fuzzy search for ${filename}`);

    const fuzzySearchObj = getState()?.drs?.fuzzySearchResponse;
    if (fuzzySearchObj === undefined) {
        const msg = `Something went wrong when pinging ${fuzzySearchUrl} ; fuzzySearchResponse is undefined`;
        console.error(msg);
        message.error(msg);
        return { [filename]: { dataUrl: null, indexUrl: null } };
    }

    const dataFileId = fuzzySearchObj.find((obj) => obj.name === filename)?.id;
    if (dataFileId === undefined) {
        const msg = "Something went wrong when obtaining dataFile id";
        console.error(msg);
        return { [filename]: { dataUrl: null, indexUrl: null } };
    }

    const dataUrl = `${getState()?.services?.itemsByKind?.drs?.url}/objects/${dataFileId}/download`;

    const indexFileId = fuzzySearchObj.find((obj) => obj.name === indexFilename)?.id;
    if (indexFileId === undefined) {
        const msg = "Something went wrong when obtaining index file id";
        console.error(msg);
        return { [filename]: { dataUrl: dataUrl, indexUrl: null } };
    }

    const indexUrl = `${getState()?.services?.itemsByKind?.drs?.url}/objects/${indexFileId}/download`;
    const urls = { [filename]: { dataUrl: dataUrl, indexUrl: indexUrl } };

    console.log(`retrieved urls: ${JSON.stringify(urls)}`);

    return urls;
};

export const getIgvUrlsFromDrs = (fileObjects) => async (dispatch, getState) => {
    if (!getState().services.drsService) {
        console.error("DRS not found");
        return;
    }

    console.log("initiating getIgvUrlsFromDrs");

    const searchesToDispatch = fileObjects.map((f) =>
        isIndexedFileType(f) ? dispatch(getDrsDataAndIndexUrls(f.filename)) : dispatch(getDrsUrl(f.filename)),
    );

    dispatch(beginIgvUrlSearch());

    await Promise.all(searchesToDispatch)
        .then((urls) => {
            // reduce array to object that's addressable by filename
            const urlsObj = urls.reduce((obj, item) => Object.assign(obj, item), {});

            console.log(`received drs urls for igv: ${JSON.stringify(urlsObj)}`);

            dispatch(setDrsUrlsForIgv(urlsObj));
        })
        .catch((err) => {
            console.log(err);
            dispatch(errorIgvUrlSearch());
        });
};

export const getFileDownloadUrlsFromDrs = (fileObjects) => async (dispatch, getState) => {
    if (!getState().services.drsService) {
        console.error("DRS not found");
        return;
    }

    console.log("initiating getFileDownloadUrlsFromDrs");

    const searchesToDispatch = fileObjects.map((f) => dispatch(getDrsUrl(f.filename)));

    dispatch(beginDownloadUrlsSearch());

    await Promise.all(searchesToDispatch)
        .then((urls) => {
            // reduce array to object that's addressable by filename
            const urlsObj = urls.reduce((obj, item) => Object.assign(obj, item), {});

            console.debug(`received download urls from drs:`, urlsObj);

            dispatch(setDownloadUrls(urlsObj));
        })
        .catch((err) => {
            console.error(err);
            dispatch(errorDownloadUrls());
        });
};


const performFuzzyNameSearch = networkAction((fuzzySearchUrl) => () => ({
    types: PERFORM_SEARCH_BY_FUZZYNAME,
    url: fuzzySearchUrl,
}));

const beginIgvUrlSearch = () => ({
    type: RETRIEVE_URLS_FOR_IGV.BEGIN,
});

const setDrsUrlsForIgv = (urls) => ({
    type: RETRIEVE_URLS_FOR_IGV.END,
    urls: urls,
});

const errorIgvUrlSearch = () => ({
    type: RETRIEVE_URLS_FOR_IGV.ERROR,
  // err: 'error retrieving DRS urls for IGV'
});

const beginDownloadUrlsSearch = () => ({
    type: RETRIEVE_URLS_FOR_DOWNLOAD.BEGIN,
});

const setDownloadUrls = (urls) => ({
    type: RETRIEVE_URLS_FOR_DOWNLOAD.END,
    urls: urls,
});

const errorDownloadUrls = () => ({
    type: RETRIEVE_URLS_FOR_DOWNLOAD.ERROR,
});


const isIndexedFileType = (fileObj) => hasIndex(fileObj.file_format ?? guessFileType(fileObj.filename));
const indexFileName = (filename) => filename + indexSuffix[guessFileType(filename)];

const indexSuffix = {
    "vcf": ".tbi",
    "cram": ".crai",
};

const hasIndex = (fileType) => {
    switch (fileType.toLowerCase()) {
        case "vcf":
        case "cram":
            return true;

        default:
            return false;
    }
};
