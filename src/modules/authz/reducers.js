import {
    CREATE_GRANT,
    CREATE_GROUP,
    DELETE_GRANT,
    DELETE_GROUP,
    FETCH_ALL_PERMISSIONS,
    FETCH_GRANTS,
    FETCH_GROUPS,
    INVALIDATE_GRANTS,
    INVALIDATE_GROUPS,
    SAVE_GROUP,
} from "./actions";
import { arrayToObjectByProperty, objectWithoutProp } from "@/utils/misc";

export const allPermissions = (
    state = {
        data: [],
        isFetching: false,
    },
    action,
) => {
    switch (action.type) {
        case FETCH_ALL_PERMISSIONS.REQUEST:
            return { ...state, isFetching: true };
        case FETCH_ALL_PERMISSIONS.RECEIVE:
            return { ...state, data: action.data };
        case FETCH_ALL_PERMISSIONS.FINISH:
            return { ...state, isFetching: false };
        default:
            return state;
    }
};

export const grants = (
    state = {
        data: [],
        itemsByID: {},
        isFetching: false,
        isCreating: false,
        isDeleting: false,
        isInvalid: false,
    },
    action,
) => {
    switch (action.type) {
        case FETCH_GRANTS.REQUEST:
            return { ...state, isFetching: true };
        case FETCH_GRANTS.RECEIVE:
            return {
                ...state,
                data: action.data,
                itemsByID: arrayToObjectByProperty(action.data, "id"),
                isInvalid: false,
            };
        case FETCH_GRANTS.FINISH:
            return { ...state, isFetching: false };

        case INVALIDATE_GRANTS:
            return { ...state, isInvalid: true };

        case CREATE_GRANT.REQUEST:
            return { ...state, isCreating: true };
        case CREATE_GRANT.RECEIVE:
            return {
                ...state,
                data: [...state.data, action.data],
                itemsByID: { ...state.itemsByID, [action.data.id]: action.data },
            };
        case CREATE_GRANT.FINISH:
            return { ...state, isCreating: false };

        case DELETE_GRANT.REQUEST:
            return { ...state, isDeleting: true };
        case DELETE_GRANT.RECEIVE:
            return {
                ...state,
                data: state.data.filter((g) => g.id !== action.grantID),
                itemsByID: objectWithoutProp(state.itemsByID, action.grantID),
            };
        case DELETE_GRANT.FINISH:
            return { ...state, isDeleting: false };

        default:
            return state;
    }
};

export const groups = (
    state = {
        data: [],
        itemsByID: {},
        isFetching: false,
        isCreating: false,
        isSaving: false,
        isDeleting: false,
        isInvalid: false,
    },
    action,
) => {
    switch (action.type) {
        case FETCH_GROUPS.REQUEST:
            return { ...state, isFetching: true };
        case FETCH_GROUPS.RECEIVE:
            return {
                ...state,
                data: action.data,
                itemsByID: arrayToObjectByProperty(action.data, "id"),
                isInvalid: false,
            };
        case FETCH_GROUPS.FINISH:
            return { ...state, isFetching: false };

        case INVALIDATE_GROUPS:
            return { ...state, isInvalid: true };

        case CREATE_GROUP.REQUEST:
            return { ...state, isCreating: true };
        case CREATE_GROUP.RECEIVE:
            return {
                ...state,
                data: [...state.data, action.data],
                itemsByID: { ...state.itemsByID, [action.data.id]: action.data },
            };
        case CREATE_GROUP.FINISH:
            return { ...state, isCreating: false };

        case SAVE_GROUP.REQUEST:
            return {
                ...state,
                isSaving: true,
                // Optimistically update the group while we wait for the PUT/subsequent (presumed) invalidate
                data: state.data.map((g) => g.id === action.group.id ? action.group : g),
                itemsByID: { ...state.itemsByID, [action.group.id]: action.group },
            };
        case SAVE_GROUP.FINISH:
            return { ...state, isSaving: false };

        case DELETE_GROUP.REQUEST:
            return { ...state, isDeleting: true };
        case DELETE_GROUP.RECEIVE:
            return {
                ...state,
                data: state.data.filter((g) => g.id !== action.groupID),
                itemsByID: objectWithoutProp(state.itemsByID, action.groupID),
            };
        case DELETE_GROUP.FINISH:
            return { ...state, isDeleting: false };

        default:
            return state;
    }
};
