import {
    PERFORM_GOHAN_GENE_SEARCH,
    FETCH_DISCOVERY_SCHEMA,
} from "./actions";

export const discovery = (
    state = {
        geneNameSearchResponse: [],
        discoverySchema: {},
    },
    action,
) => {
    switch (action.type) {
        case PERFORM_GOHAN_GENE_SEARCH.RECEIVE:
            return {
                ...state,
                geneNameSearchResponse: action.data.results,
            };
        case FETCH_DISCOVERY_SCHEMA.RECEIVE:
            return {
                ...state,
                discoverySchema: action.data,
            };
        default:
            return state;
    }
};
