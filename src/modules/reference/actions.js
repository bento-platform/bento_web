import { createNetworkActionTypes, networkAction } from "../../utils/actions";

export const FETCH_REFERENCE_GENOMES = createNetworkActionTypes("REFERENCE.FETCH_REFERENCE_GENOMES");

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
