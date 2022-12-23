import {
    PERFORM_GOHAN_GENE_SEARCH,
    PERFORM_GET_GOHAN_VARIANTS_OVERVIEW
} from "./actions";

export const discovery = (
    state = {
        geneNameSearchResponse: [],
        variantsOverviewResponse: {},
    },
    action
) => {
    switch (action.type) {
        case PERFORM_GOHAN_GENE_SEARCH.RECEIVE:
            return {
                ...state,
                geneNameSearchResponse: action.data.results
            };

            case PERFORM_GET_GOHAN_VARIANTS_OVERVIEW.RECEIVE:
            return {
                ...state,
                variantsOverviewResponse: action.data
            };            

        default:
            return state;
    }
};
