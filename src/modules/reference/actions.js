import { createNetworkActionTypes, networkAction } from "../../utils/actions";

export const FETCH_REFERENCE_GENOMES = createNetworkActionTypes("REFERENCE.FETCH_REFERENCE_GENOMES");
export const DELETE_REFERENCE_GENOME = createNetworkActionTypes("REFERENCE.DELETE_REFERENCE_GENOME");

const fetchReferenceGenomes = networkAction(() => (dispatch, getState) => ({
    types: FETCH_REFERENCE_GENOMES,
    url: `${getState().services.itemsByKind.reference.url}/genomes`,
    err: "Error fetching reference genomes",
}));

export const fetchReferenceGenomesIfNeeded = () => (dispatch, getState) => {
    if (getState().referenceGenomes.isFetching || getState().referenceGenomes.items.length) {
        return;
    }
    return dispatch(fetchReferenceGenomes());
};

const deleteReferenceGenome = networkAction((genomeID) => (dispatch, getState) => ({
    types: DELETE_REFERENCE_GENOME,
    params: {genomeID},
    url: `${getState().services.itemsByKind.reference.url}/genomes/${genomeID}`,
    req: { method: "DELETE" },
    err: `Error deleting reference genome ${genomeID}`,
}));

export const deleteReferenceGenomeIfPossible = (genomeID) => (dispatch, getState) => {
    if (getState().referenceGenomes.isFetching || getState().referenceGenomes.isDeletingIDs[genomeID]) {
        return;
    }
    return dispatch(deleteReferenceGenome(genomeID));
};
