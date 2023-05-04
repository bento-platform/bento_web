import {
    FETCH_OPENID_CONFIGURATION,
    FETCH_USER,
    FETCHING_USER_DEPENDENT_DATA,
    FETCHING_USER_DEPENDENT_DATA_SILENT,
    SET_USER
} from "./actions";

export const auth = (
    state = {
        user: null,
        isFetching: false,
        hasAttempted: false,
        isFetchingDependentData: false,
        isFetchingDependentDataSilent: false,
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

        case FETCHING_USER_DEPENDENT_DATA_SILENT.BEGIN:
            return {...state, isFetchingDependentDataSilent: true};
        case FETCHING_USER_DEPENDENT_DATA_SILENT.END:
        case FETCHING_USER_DEPENDENT_DATA_SILENT.TERMINATE:
            return {...state, isFetchingDependentDataSilent: false};

        default:
            return state;
    }
};

export const openIdConfiguration = (
    state = {
        data: null,
        isFetching: false,
    },
    action
) => {
    switch (action.type) {
        case FETCH_OPENID_CONFIGURATION.REQUEST:
            return {...state, isFetching: true};
        case FETCH_OPENID_CONFIGURATION.RECEIVE:
            return {...state, data: action.data};
        case FETCH_OPENID_CONFIGURATION.ERROR:
            return {...state, data: null};
        case FETCH_OPENID_CONFIGURATION.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};
