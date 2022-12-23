import {createNetworkActionTypes, networkAction} from "../../utils/actions";


export const PERFORM_GOHAN_GENE_SEARCH = createNetworkActionTypes("GOHAN_GENE_SEARCH");
export const PERFORM_GET_GOHAN_VARIANTS_OVERVIEW = createNetworkActionTypes("GET_GOHAN_VARIANTS_OVERVIEW");



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


export const performGetGohanVariantsOverviewIfPossible = () => (dispatch, getState) => {
    const gohanUrl = getState()?.services?.gohan?.url;
    const bentoBaseUrl = `${getState().nodeInfo.data.CHORD_URL}`;
    const overviewPath = `/variants/overview`;
    const getUrl = gohanUrl ? `${gohanUrl}${overviewPath}` : `${bentoBaseUrl}api/gohan${overviewPath}`;
    dispatch(performGetGohanVariantsOverview(getUrl));
};
const performGetGohanVariantsOverview = networkAction((getUrl) => () => ({
    types: PERFORM_GET_GOHAN_VARIANTS_OVERVIEW,
    url: getUrl,
    err: "error getting Gohan variants overview",
}));
