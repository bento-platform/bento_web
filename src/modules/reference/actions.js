import { createNetworkActionTypes, networkAction } from "@/utils/actions";

export const FETCH_REFERENCE_GENOMES = createNetworkActionTypes("REFERENCE.FETCH_REFERENCE_GENOMES");
export const DELETE_REFERENCE_GENOME = createNetworkActionTypes("REFERENCE.DELETE_REFERENCE_GENOME");

const fetchReferenceGenomes = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_REFERENCE_GENOMES,
    url: `${getState().services.itemsByKind.reference.url}/genomes`,
    publicEndpoint: true,
    err: "Error fetching reference genomes",
}));

export const fetchReferenceGenomesIfNeeded = () => (dispatch, getState) => {
    const state = getState();
    if (
        !state.services.itemsByKind.reference
        || state.referenceGenomes.isFetching
        || state.referenceGenomes.items.length
    ) {
        return Promise.resolve();
    }
    return dispatch(fetchReferenceGenomes());
};

const deleteReferenceGenome = networkAction((genomeID) => (_dispatch, getState) => ({
    types: DELETE_REFERENCE_GENOME,
    params: {genomeID},
    url: `${getState().services.itemsByKind.reference.url}/genomes/${genomeID}`,
    req: { method: "DELETE" },
    err: `Error deleting reference genome ${genomeID}`,
}));

export const deleteReferenceGenomeIfPossible = (genomeID) => (dispatch, getState) => {
    const state = getState();
    if (
        !state.services.itemsByKind.reference
        || state.referenceGenomes.isFetching
        || state.referenceGenomes.isDeletingIDs[genomeID]
    ) {
        return Promise.resolve();
    }
    return dispatch(deleteReferenceGenome(genomeID));
};
