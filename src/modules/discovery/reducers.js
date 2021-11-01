import {simpleDeepCopy} from "../../utils/misc";

import {
    PERFORM_SEARCH,
    SELECT_SEARCH,

    ADD_DATA_TYPE_QUERY_FORM,
    UPDATE_DATA_TYPE_QUERY_FORM,
    REMOVE_DATA_TYPE_QUERY_FORM,
    REMOVE_ALL_DATA_TYPE_QUERY_FORMS,

    UPDATE_JOIN_QUERY_FORM,

    PERFORM_GOHAN_GENE_SEARCH,
} from "./actions";

import {
    addDataTypeFormIfPossible,
    updateDataTypeFormIfPossible,
    removeDataTypeFormIfPossible,
} from "../../utils/search";

export const discovery = (
    state = {
        isFetching: false,

        dataTypeForms: [],
        joinFormValues: {},

        searches: [],
        selectedSearch: null,

        geneNameSearchResponse: {},
    },
    action
) => {
    switch (action.type) {
        case PERFORM_SEARCH.REQUEST:
            return {...state, isFetching: true};
        case PERFORM_SEARCH.RECEIVE:
            return {
                ...state,
                searches: [...state.searches, action.data], // Add search to search history
                lastUpdated: action.receivedAt
            };
        case PERFORM_SEARCH.FINISH:
            return {...state, isFetching: false};

        case SELECT_SEARCH:
            return {...state, selectedSearch: action.searchIndex};

        case ADD_DATA_TYPE_QUERY_FORM:
            return {...state, dataTypeForms: addDataTypeFormIfPossible(state.dataTypeForms, action.dataType)};
        case UPDATE_DATA_TYPE_QUERY_FORM:
            return {
                ...state,
                dataTypeForms: updateDataTypeFormIfPossible(state.dataTypeForms, action.dataType, action.fields)
            };
        case REMOVE_DATA_TYPE_QUERY_FORM:
            return {...state, dataTypeForms: removeDataTypeFormIfPossible(state.dataTypeForms, action.dataType)};
        case REMOVE_ALL_DATA_TYPE_QUERY_FORMS:
            return {...state, dataTypeForms: []};

        case UPDATE_JOIN_QUERY_FORM:
            return {
                ...state,
                joinFormValues: simpleDeepCopy(action.fields)  // TODO: Hack-y deep clone
            };

        case PERFORM_GOHAN_GENE_SEARCH.RECEIVE:
            return {
                ...state,
                geneNameSearchResponse: action.data.results
            }

        default:
            return state;
    }
};
