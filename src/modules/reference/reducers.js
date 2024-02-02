import { DELETE_REFERENCE_GENOME, FETCH_REFERENCE_GENOMES } from "./actions";
import { arrayToObjectByProperty, objectWithoutProp } from "../../utils/misc";

export const referenceGenomes = (
    state = {
        hasAttempted: false,
        isFetching: false,
        isDeletingIDs: {},
        items: [],
        itemsByID: {},
    },
    action,
) => {
    switch (action.type) {
        // FETCH_REFERENCE_GENOMES
        case FETCH_REFERENCE_GENOMES.REQUEST:
            return {...state, isFetching: true};
        case FETCH_REFERENCE_GENOMES.RECEIVE:
            return {
                ...state,
                items: action.data,
                itemsByID: arrayToObjectByProperty(action.data, "id"),
            };
        case FETCH_REFERENCE_GENOMES.FINISH:
            return {...state, isFetching: false, hasAttempted: true};

        // DELETE_REFERENCE_GENOME
        case DELETE_REFERENCE_GENOME.REQUEST:
            return {...state, isDeletingIDs: {...state.isDeletingIDs, [action.genomeID]: true}};
        case DELETE_REFERENCE_GENOME.RECEIVE: {
            const { genomeID } = action;
            return {
                ...state,
                items: state.items.filter((g) => g.id !== genomeID),
                itemsByID: objectWithoutProp(state.itemsByID, genomeID),
            };
        }
        case DELETE_REFERENCE_GENOME.FINISH: {
            return {...state, isDeletingIDs: objectWithoutProp(state.isDeletingIDs, action.genomeID)};
        }

        default:
            return state;
    }
};
