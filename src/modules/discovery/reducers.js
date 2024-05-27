import {
    PERFORM_REFERENCE_GENE_SEARCH,
} from "./actions";

export const discovery = (
    state = {
        geneNameSearchResponse: [],
    },
    action,
) => {
    switch (action.type) {
        case PERFORM_REFERENCE_GENE_SEARCH.RECEIVE:
            return {
                ...state,
                geneNameSearchResponse: action.data.results,
            };

        default:
            return state;
    }
};
