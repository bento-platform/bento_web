import {createNetworkActionTypes, networkAction} from "@/utils/actions";


export const PERFORM_REFERENCE_GENE_SEARCH = createNetworkActionTypes("REFERENCE_GENE_SEARCH");



export const performReferenceGeneSearchIfPossible = (searchTerm, assemblyId) => (dispatch, getState) => {
    const referenceUrl = getState()?.services?.itemsByKind?.reference?.url;
    if (!referenceUrl) return;
    const params = new URLSearchParams();
    params.set("name", searchTerm);
    params.set("name_fzy", "true");
    params.set("limit", "10");
    const searchUrl = `${referenceUrl}/genomes/${assemblyId}/features?${params.toString()}`;
    dispatch(performReferenceGeneSearch(searchUrl));
};

const performReferenceGeneSearch = networkAction((searchUrl) => () => ({
    types: PERFORM_REFERENCE_GENE_SEARCH,
    url: searchUrl,
    err: "error performing Gohan gene search",
}));
