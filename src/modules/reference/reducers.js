import { FETCH_REFERENCE_GENOMES } from "./actions";

export const referenceGenomes = (
    state = {
        hasAttempted: false,
        isFetching: false,
        items: [],
        itemsByID: {},
    },
    action,
) => {
    switch (action.type) {
        case FETCH_REFERENCE_GENOMES.REQUEST:
            return {...state, isFetching: true};
        case FETCH_REFERENCE_GENOMES.RECEIVE:
            return {
                ...state,
                items: action.data,
                itemsByID: Object.fromEntries(action.data.map((g) => [g.id, g])),
            };
        case FETCH_REFERENCE_GENOMES.FINISH:
            return {...state, isFetching: false, hasAttempted: true};
        default:
            return state;
    }
};
