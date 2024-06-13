import {createNetworkActionTypes, networkAction} from "../../utils/actions";


export const PERFORM_GOHAN_GENE_SEARCH = createNetworkActionTypes("GOHAN_GENE_SEARCH");
export const FETCH_DISCOVERY_SCHEMA = createNetworkActionTypes("FETCH_DISCOVERY_SCHEMA");
export const FETCH_DATS_SCHEMA = createNetworkActionTypes("FETCH_DATS_SCHEMA");

export const performGohanGeneSearchIfPossible = (searchTerm, assemblyId) => (dispatch, getState) => {
    const gohanUrl = getState()?.services?.itemsByKind?.gohan?.url;
    if (!gohanUrl) return;
    const queryString = `/genes/search?term=${searchTerm}&assemblyId=${assemblyId}`;
    const searchUrl = `${gohanUrl}${queryString}`;
    dispatch(performGohanGeneSearch(searchUrl));
};

const performGohanGeneSearch = networkAction((searchUrl) => () => ({
    types: PERFORM_GOHAN_GENE_SEARCH,
    url: searchUrl,
    err: "error performing Gohan gene search",
}));

const _fetchDiscoverySchema = networkAction(() => (dispatch, getState) => ({
    types: FETCH_DISCOVERY_SCHEMA,
    url: `${getState().bentoServices.itemsByKind.metadata.url}/api/schemas/discovery`,
    err: "Error fetching discovery JSON schema",
}));

export const fetchDiscoverySchema = () => (dispatch, getState) => {
    const metadataUrl = getState()?.bentoServices?.itemsByKind?.metadata?.url;
    if (!metadataUrl) return Promise.resolve();
    return dispatch(_fetchDiscoverySchema());
};
