import { FETCH_GRANTS, FETCH_GROUPS } from "../auth/actions";

export const grants = (
    state = {
        data: [],
        isFetching: false,
    },
    action,
) => {
    switch (action.type) {
        case FETCH_GRANTS.REQUEST:
            return {...state, isFetching: true};
        case FETCH_GRANTS.RECEIVE:
            return {...state, data: action.data, isFetching: false};
        case FETCH_GRANTS.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};

export const groups = (
    state = {
        data: [],
        isFetching: false,
    },
    action,
) => {
    switch (action.type) {
        case FETCH_GROUPS.REQUEST:
            return {...state, isFetching: true};
        case FETCH_GROUPS.RECEIVE:
            return {...state, data: action.data, isFetching: false};
        case FETCH_GROUPS.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};
