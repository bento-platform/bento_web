import {createNetworkActionTypes, networkAction} from "../../utils/actions";


export const PERFORM_GOHAN_GENE_SEARCH = createNetworkActionTypes("GOHAN_GENE_SEARCH");



export const performGohanGeneSearchIfPossible = (searchTerm, assemblyId) => (dispatch, getState) => {
    const gohanUrl = getState()?.services?.gohan?.url;
    const bentoBaseUrl = `${getState().nodeInfo.data.CHORD_URL}`;
    const queryString = `/genes/search?term=${searchTerm}&assemblyId=${assemblyId}`;
    const searchUrl = gohanUrl ? `${gohanUrl}${queryString}` : `${bentoBaseUrl}api/gohan${queryString}`;
    dispatch(performGohanGeneSearch(searchUrl));
};

const performGohanGeneSearch = networkAction((searchUrl) => () => ({
    types: PERFORM_GOHAN_GENE_SEARCH,
    url: searchUrl,
    err: "error performing Gohan gene search",
}));
