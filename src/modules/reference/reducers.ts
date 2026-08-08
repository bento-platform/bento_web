import type { Reducer } from "redux";

import { arrayToObjectByProperty, objectWithoutProp } from "@/utils/misc";

import { DELETE_REFERENCE_GENOME, FETCH_REFERENCE_GENOMES } from "./actions";
import type { Genome } from "./types";

type ReferenceGenomesState = {
  hasAttempted: boolean;
  isFetching: boolean;
  isDeletingIDs: Record<string, boolean>; // TODO: refactor into set
  items: Genome[];
  itemsByID: Record<string, Genome>;
  itemsByIDLower: Record<string, Genome>;
};

export const referenceGenomes: Reducer<ReferenceGenomesState> = (
  state = {
    hasAttempted: false,
    isFetching: false,
    isDeletingIDs: {},
    items: [],
    itemsByID: {},
    itemsByIDLower: {},
  },
  action,
) => {
  switch (action.type) {
    // FETCH_REFERENCE_GENOMES
    case FETCH_REFERENCE_GENOMES.REQUEST:
      return { ...state, isFetching: true };
    case FETCH_REFERENCE_GENOMES.RECEIVE: {
      const genomesByID = arrayToObjectByProperty(action.data, "id") as Record<string, Genome>;
      return {
        ...state,
        items: action.data,
        itemsByID: genomesByID,
        itemsByIDLower: Object.fromEntries(Object.entries(genomesByID).map(([k, v]) => [k.toLowerCase(), v])),
      };
    }
    case FETCH_REFERENCE_GENOMES.FINISH:
      return { ...state, isFetching: false, hasAttempted: true };

    // DELETE_REFERENCE_GENOME
    case DELETE_REFERENCE_GENOME.REQUEST:
      return { ...state, isDeletingIDs: { ...state.isDeletingIDs, [action.genomeID]: true } };
    case DELETE_REFERENCE_GENOME.RECEIVE: {
      const { genomeID } = action;
      return {
        ...state,
        items: state.items.filter((g) => g.id !== genomeID),
        itemsByID: objectWithoutProp(state.itemsByID, genomeID),
        itemsByIDLower: objectWithoutProp(state.itemsByIDLower, genomeID.toLowerCase()),
      };
    }
    case DELETE_REFERENCE_GENOME.FINISH: {
      return { ...state, isDeletingIDs: objectWithoutProp(state.isDeletingIDs, action.genomeID) };
    }

    default:
      return state;
  }
};
