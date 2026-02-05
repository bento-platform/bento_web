import { message } from "antd";

import { createNetworkActionTypes, networkAction } from "@/utils/actions";
import { guessFileType } from "@/utils/files";

export const PERFORM_DRS_OBJECT_SEARCH = createNetworkActionTypes("PERFORM_DRS_OBJECT_SEARCH");
export const CLEAR_DRS_OBJECT_SEARCH = "CLEAR_DRS_OBJECT_SEARCH";
export const GET_DRS_OBJECT = createNetworkActionTypes("GET_DRS_OBJECT");
export const DELETE_DRS_OBJECT = createNetworkActionTypes("DELETE_DRS_OBJECT");

export const PERFORM_SEARCH_BY_FUZZY_NAME = createNetworkActionTypes("PERFORM_SEARCH_BY_FUZZY_NAME");

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

const drsObjectDownloadUrl = (drsUrl, objId) => `${drsUrl}/objects/${objId}/download`;

// for igv-viewable files, get data (and maybe index file) urls in a single network call
const getDrsUrls =
  (fileObj, skipIndex = false) =>
  async (dispatch, getState) => {
    const filename = fileObj.filename;

    const drsUrl = getState().services.drsService.url;

    const isIndexed = isIndexedFileType(fileObj);
    const shouldFetchIndex = isIndexed && !skipIndex;

    console.debug(`Initiating getDrsUrls (isIndexed=${isIndexed}, skipIndex=${skipIndex})`);

    const result = { url: null, ...(shouldFetchIndex ? { indexUrl: null } : {}) };

    // Skipping fuzzy search for local path
    if (filename.startsWith("/")) {
      return { [filename]: result };
    }

    const fuzzySearchUrl = `${drsUrl}/search?fuzzy_name=${filename}`;
    await dispatch(performFuzzyNameSearch(fuzzySearchUrl));
    console.debug(`Completed fuzzy search for ${filename}`);

    const fuzzySearchObj = getState()?.drs?.fuzzySearchResponse;
    if (fuzzySearchObj === undefined) {
      const msg = `Something went wrong when pinging ${fuzzySearchUrl} ; fuzzySearchResponse is undefined`;
      console.error(msg);
      message.error(msg);
      return { [filename]: result };
    }

    const dataFileId = fuzzySearchObj.find((obj) => obj.name === filename)?.id;
    if (dataFileId === undefined) {
      console.error(`Something went wrong when obtaining data file ID for ${filename}`);
      return { [filename]: result };
    }

    result.url = drsObjectDownloadUrl(drsUrl, dataFileId);

    if (shouldFetchIndex) {
      const indexFilename = indexFileName(filename);

      result.indexUrl = null;

      const indexFileId = fuzzySearchObj.find((obj) => obj.name === indexFilename)?.id;
      if (indexFileId === undefined) {
        console.error(`Something went wrong when obtaining index file ID for ${indexFilename}`);
        return { [filename]: result };
      }

      result.indexUrl = drsObjectDownloadUrl(drsUrl, indexFileId);
    }

    const urls = { [filename]: result };
    console.debug(`retrieved DRS urls: ${JSON.stringify(urls)}`);
    return urls;
  };

const groupDrsUrls = (urls) => urls.reduce((obj, item) => Object.assign(obj, item), {});

// TODO: completely deduplicate these two functions

export const getIgvUrlsFromDrs = (fileObjects) => async (dispatch, getState) => {
  if (!getState().services.drsService) {
    console.error("DRS not found");
    return;
  }

  console.log("initiating getIgvUrlsFromDrs");

  const dispatchedSearches = fileObjects.map((f) => dispatch(getDrsUrls(f)));

  dispatch(beginIgvUrlSearch());

  try {
    // reduce array to object that's addressable by filename
    const urlsObj = groupDrsUrls(await Promise.all(dispatchedSearches));
    console.debug(`received drs urls for igv: ${JSON.stringify(urlsObj)}`);
    dispatch(setDrsUrlsForIgv(urlsObj));
  } catch (err) {
    console.error(err);
    dispatch(errorIgvUrlSearch());
  }
};

export const getFileDownloadUrlsFromDrs = (fileObjects) => async (dispatch, getState) => {
  if (!getState().services.drsService) {
    console.error("DRS not found");
    return;
  }

  console.log("initiating getFileDownloadUrlsFromDrs");

  const dispatchedSearches = fileObjects.map((f) => dispatch(getDrsUrls(f, true)));

  dispatch(beginDownloadUrlsSearch());

  try {
    // reduce array to object that's addressable by filename
    const urlsObj = groupDrsUrls(await Promise.all(dispatchedSearches));
    console.debug("received download urls from drs:", urlsObj);
    dispatch(setDownloadUrls(urlsObj));
  } catch (err) {
    console.error(err);
    dispatch(errorDownloadUrls());
  }
};

export const performDRSObjectSearch = networkAction((q) => (_dispatch, getState) => ({
  types: PERFORM_DRS_OBJECT_SEARCH,
  params: { q },
  url: `${getState().services.drsService.url}/search?${new URLSearchParams({ q, with_bento_properties: "true" })}`,
  err: "Error while searching for DRS objects",
}));

export const clearDRSObjectSearch = () => ({ type: CLEAR_DRS_OBJECT_SEARCH });

// Get DRS object record:
export const getDRSObject = networkAction((uri) => () => {
  const parsedDrsUri = URL.parse(uri);
  const url =
    parsedDrsUri.protocol === "drs:"
      ? `https://${parsedDrsUri.host}/ga4gh/drs/v1/objects${parsedDrsUri.pathname}`
      : uri;
  return {
    types: GET_DRS_OBJECT,
    params: { uri },
    url, // Token will be included only if this matches the local Bento host (checked by networkAction)
    err: "Error fetching DRS object record",
  };
});

export const deleteDRSObject = networkAction((drsObject) => (_dispatch, getState) => ({
  types: DELETE_DRS_OBJECT,
  params: { drsObject },
  url: `${getState().services.drsService.url}/objects/${drsObject.id}`,
  req: { method: "DELETE" },
  err: "Error while deleting DRS object",
  onSuccess: () => {
    message.success(`DRS object "${drsObject.name}" deleted successfully!`);
  },
}));

const performFuzzyNameSearch = networkAction((fuzzySearchUrl) => () => ({
  types: PERFORM_SEARCH_BY_FUZZY_NAME,
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

const indexSuffix = {
  gvcf: ".tbi",
  vcf: ".tbi",
  bam: ".bai",
  cram: ".crai",
};

const indexFileName = (filename) => filename + indexSuffix[guessFileType(filename)];

const hasIndex = (fileType) => {
  switch (fileType.toLowerCase()) {
    case "gvcf":
    case "vcf":
    case "bam":
    case "cram":
      return true;

    default:
      return false;
  }
};
