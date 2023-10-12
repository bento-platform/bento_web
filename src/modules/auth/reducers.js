import {message} from "antd";
import {decodeJwt} from "jose";

import {
    TOKEN_HANDOFF,
    FETCH_OPENID_CONFIGURATION,
    FETCHING_USER_DEPENDENT_DATA,
    REFRESH_TOKENS,
    SIGN_OUT,
    FETCH_RESOURCE_PERMISSIONS,
    FETCH_GRANTS,
    FETCH_GROUPS,
} from "./actions";
import {recursiveOrderedObject} from "../../utils/misc";

const nullSession = {
    sessionExpiry: null,
    idToken: null,
    idTokenContents: null,
    accessToken: null,
    refreshToken: null,
};

export const auth = (
    state = {
        hasAttempted: false,
        isFetchingDependentData: false,

        isHandingOffCodeForToken: false,
        handoffError: "",

        isRefreshingTokens: false,
        tokensRefreshError: "",

        // Below is token/token-derived data

        sessionExpiry: null,
        idToken: null,
        idTokenContents: null,

        //  - NEVER dehydrate the below items to localStorage; it is a security risk!
        accessToken: null,
        refreshToken: null,

        // Below is permissions caching for controlling how the UI appears for different resources
        //  - It's in this reducer since signing out / losing a token will clear permissions caches.
        resourcePermissions: {},
    },
    action,
) => {
    switch (action.type) {
        // FETCHING_USER_DEPENDENT_DATA
        case FETCHING_USER_DEPENDENT_DATA.BEGIN:
            return {...state, isFetchingDependentData: true};
        case FETCHING_USER_DEPENDENT_DATA.END:
        case FETCHING_USER_DEPENDENT_DATA.TERMINATE:
            return {...state, isFetchingDependentData: false, hasAttempted: true};

        // TOKEN_HANDOFF
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

            // Reset hasAttempted for user-dependent data if we just signed in
            const hasAttempted = (!state.idTokenContents && idToken) ? false : state.hasAttempted;

            return {
                ...state,
                hasAttempted,
                sessionExpiry: (new Date()).getTime() / 1000 + exp,
                idToken,
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
                ...nullSession,
                handoffError,
                resourcePermissions: {},
            };
        }
        case TOKEN_HANDOFF.FINISH:
            return {...state, isHandingOffCodeForToken: false};

        // REFRESH_TOKENS
        case REFRESH_TOKENS.REQUEST:
            return {...state, isRefreshingTokens: true};
        case REFRESH_TOKENS.ERROR: {
            const {error, error_description: errorDesc} = action.data ?? {};
            const tokensRefreshError = error
                ? `${error}: ${errorDesc}`
                : `An error occurred while refreshing tokens: ${action.caughtError ?? "Unknown error"}`;
            console.error(tokensRefreshError);
            return {
                ...state,
                ...nullSession,
                tokensRefreshError,
                resourcePermissions: {},
            };
        }
        case REFRESH_TOKENS.FINISH: {
            return {...state, isRefreshingTokens: false};
        }

        // SIGN_OUT
        case SIGN_OUT:
            // TODO: sign out of Keycloak too? (in action, not in reducer)
            return {
                ...state,
                ...nullSession,
                tokensRefreshError: "",
                resourcePermissions: {},
            };

        // FETCH_RESOURCE_PERMISSIONS
        case FETCH_RESOURCE_PERMISSIONS.REQUEST: {
            const resourceKey = JSON.stringify(recursiveOrderedObject(action.resource));
            return {
                ...state,
                resourcePermissions: {
                    ...state.resourcePermissions,
                    [resourceKey]: {
                        ...(state.resourcePermissions[resourceKey] ?? {}),
                        isFetching: true,
                        hasAttempted: false,
                        permissions: [],
                        error: "",
                    },
                },
            };
        }
        case FETCH_RESOURCE_PERMISSIONS.RECEIVE: {
            const resourceKey = JSON.stringify(recursiveOrderedObject(action.resource));
            return {
                ...state,
                resourcePermissions: {
                    ...state.resourcePermissions,
                    [resourceKey]: {
                        ...(state.resourcePermissions[resourceKey] ?? {}),
                        permissions: action.data?.result ?? [],
                    },
                },
            };
        }
        case FETCH_RESOURCE_PERMISSIONS.ERROR: {
            const resourceKey = JSON.stringify(recursiveOrderedObject(action.resource));
            return {
                ...state,
                resourcePermissions: {
                    ...state.resourcePermissions,
                    [resourceKey]: {
                        ...(state.resourcePermissions[resourceKey] ?? {}),
                        error: action.caughtError ?? "An error occurred while fetching permissions for a resource",
                    },
                },
            };
        }
        case FETCH_RESOURCE_PERMISSIONS.FINISH: {
            const resourceKey = JSON.stringify(recursiveOrderedObject(action.resource));
            return {
                ...state,
                resourcePermissions: {
                    ...state.resourcePermissions,
                    [resourceKey]: {
                        ...(state.resourcePermissions[resourceKey] ?? {}),
                        isFetching: false,
                        hasAttempted: true,
                    },
                },
            };
        }

        default:
            return state;
    }
};

export const openIdConfiguration = (
    state = {
        data: null,
        expiry: null,
        isFetching: false,
    },
    action,
) => {
    switch (action.type) {
        case FETCH_OPENID_CONFIGURATION.REQUEST:
            return {...state, isFetching: true};
        case FETCH_OPENID_CONFIGURATION.RECEIVE:
            return {...state, data: action.data, expiry: Date.now() / 1000 + (3 * 60 * 60)};  // Cache for 3 hours
        case FETCH_OPENID_CONFIGURATION.ERROR:
            return {...state, data: null, expiry: null};
        case FETCH_OPENID_CONFIGURATION.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};

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
