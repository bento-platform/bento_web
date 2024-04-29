import {
    DELETE_GRANT,
    DELETE_GROUP,
    FETCH_GRANTS,
    FETCH_GROUPS,
    INVALIDATE_GRANTS,
    INVALIDATE_GROUPS,
} from "./actions";

export const grants = (
    state = {
        data: [],
        isFetching: false,
        isDeleting: false,
        isInvalid: false,
    },
    action,
) => {
    switch (action.type) {
        case FETCH_GRANTS.REQUEST:
            return { ...state, isFetching: true };
        case FETCH_GRANTS.RECEIVE:
            return { ...state, data: action.data, isInvalid: false };
        case FETCH_GRANTS.FINISH:
            return { ...state, isFetching: false };

        case INVALIDATE_GRANTS:
            return { ...state, isInvalid: true };

        case DELETE_GRANT.REQUEST:
            return { ...state, isDeleting: true };
        case DELETE_GRANT.RECEIVE:
            return { ...state, data: state.data.filter((g) => g.id !== action.grantID) };
        case DELETE_GRANT.FINISH:
            return { ...state, isDeleting: false };

        default:
            return state;
    }
};

export const groups = (
    state = {
        data: [],
        isFetching: false,
        isDeleting: false,
        isInvalid: false,
    },
    action,
) => {
    switch (action.type) {
        case FETCH_GROUPS.REQUEST:
            return { ...state, isFetching: true };
        case FETCH_GROUPS.RECEIVE:
            return { ...state, data: action.data, isInvalid: false };
        case FETCH_GROUPS.FINISH:
            return { ...state, isFetching: false };

        case INVALIDATE_GROUPS:
            return { ...state, isInvalid: true };

        case DELETE_GROUP.REQUEST:
            return { ...state, isDeleting: true };
        case DELETE_GROUP.RECEIVE:
            return { ...state, data: state.data.filter((g) => g.id !== action.groupID) };
        case DELETE_GROUP.FINISH:
            return { ...state, isDeleting: false };

        default:
            return state;
    }
};
