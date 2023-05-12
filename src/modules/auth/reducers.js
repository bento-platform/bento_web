import {message} from "antd";
import {decodeJwt} from "jose";

import {
    TOKEN_HANDOFF,
    FETCH_OPENID_CONFIGURATION,
    FETCHING_USER_DEPENDENT_DATA,
    FETCHING_USER_DEPENDENT_DATA_SILENT,
    REFRESH_TOKENS,
} from "./actions";

export const auth = (
    state = {
        hasAttempted: false,
        isFetchingDependentData: false,
        isFetchingDependentDataSilent: false,

        isHandingOffCodeForToken: false,
        handoffError: "",

        isRefreshingTokens: false,
        tokensRefreshError: "",

        // Below is token/token-derived data

        sessionExpiry: null,
        idTokenContents: null,

        //  - NEVER dehydrate the below items to localStorage; it is a security risk!
        accessToken: null,
        refreshToken: null,
    },
    action
) => {
    switch (action.type) {
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

        case TOKEN_HANDOFF.REQUEST:
            return {...state, isHandingOffCodeForToken: true};
        case TOKEN_HANDOFF.RECEIVE:
        case REFRESH_TOKENS.RECEIVE: {  // Same response from token handoff & token renewal
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
                refreshToken: refreshToken ?? state.refreshToken,
            };
        }
        case TOKEN_HANDOFF.ERROR: {
            let handoffError = "Error handing off authorization code for token";

            const {error, error_description: errorDesc} = action.data ?? {};
            if (error) {
                handoffError = `${error}: ${errorDesc}`;
            }

            message.error(handoffError);
            console.error(handoffError);
            return {
                ...state,
                sessionExpiry: null,
                idTokenContents: null,
                accessToken: null,
                refreshToken: null,
                handoffError,
            };
        }
        case TOKEN_HANDOFF.FINISH:
            return {...state, isHandingOffCodeForToken: false};

        case REFRESH_TOKENS.REQUEST:
            return {...state, isRefreshingTokens: true};
        case REFRESH_TOKENS.ERROR: {
            const {error, error_description: errorDesc} = action.data;
            const tokensRefreshError = `${error}: ${errorDesc}`;
            console.error(tokensRefreshError);
            return {
                ...state,
                sessionExpiry: null,
                idTokenContents: null,
                accessToken: null,
                refreshToken: null,
                tokensRefreshError,
            };
        }
        case REFRESH_TOKENS.FINISH: {
            return {...state, isRefreshingTokens: false};
        }

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
