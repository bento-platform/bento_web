import {FETCH_USER, FETCHING_USER_DEPENDENT_DATA, SET_USER} from "./actions";

export const auth = (
    state = {
        user: null,
        isFetching: false,
        hasAttempted: false,
        isFetchingDependentData: false,
    },
    action
) => {
    switch (action.type) {
        case FETCH_USER.REQUEST:
            return {...state, isFetching: true};
        case FETCH_USER.RECEIVE:
            return {...state, user: action.data};
        case FETCH_USER.ERROR:
            // TODO: Handle different errors differently?
            return {...state, user: null};
        case FETCH_USER.FINISH:
            return {...state, isFetching: false, hasAttempted: true};

        case SET_USER:
            return {...state, user: action.data};

        case FETCHING_USER_DEPENDENT_DATA.BEGIN:
            return {...state, isFetchingDependentData: true};

        case FETCHING_USER_DEPENDENT_DATA.END:
        case FETCHING_USER_DEPENDENT_DATA.TERMINATE:
            return {...state, isFetchingDependentData: false};

        default:
            return state;
    }
};
