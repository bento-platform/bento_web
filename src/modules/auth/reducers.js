import {message} from "antd";
import {decodeJwt} from "jose";

import {
    ACCESS_TOKEN_HANDOFF,
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

        isHandingOffCodeForToken: false,
        handoffError: "",

        sessionExpiry: null,
        idTokenContents: null,

        // NEVER dehydrate the below items to localStorage; it is a security risk!
        accessToken: null,
        refreshToken: null,
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

        case ACCESS_TOKEN_HANDOFF.REQUEST:
            return {...state, isHandingOffCodeForToken: true};
        case ACCESS_TOKEN_HANDOFF.RECEIVE: {
            const {
                access_token: accessToken,
                expires_in: exp,
                id_token: idToken,
                refresh_token: refreshToken,
            } = action.data;

            return {
                ...state,
                sessionExpiry: (new Date()).getTime() / 1000 + exp,
                idTokenContents: decodeJwt(idToken),  // OK to decode ID token
                accessToken,  // A client (i.e., the web app) MUST not decode the access token
                refreshToken,
            };
        }
        case ACCESS_TOKEN_HANDOFF.ERROR: {
            const {error, error_description: errorDesc} = action.data;
            const handoffError = `${error}: ${errorDesc}`;
            message.error(handoffError);
            console.error(handoffError)
            return {...state, idTokenContents: null, accessToken: null, refreshToken: null, handoffError};
        }
        case ACCESS_TOKEN_HANDOFF.FINISH:
            return {...state, isHandingOffCodeForToken: false};

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
