import {message} from "antd";

import {AUTH_CALLBACK_URL, CLIENT_ID, OPENID_CONFIG_URL} from "../../config";

import {
    basicAction,
    beginFlow,
    createFlowActionTypes,
    createNetworkActionTypes,
    endFlow,
    networkAction
} from "../../utils/actions";

import {fetchDropBoxTreeOrFail} from "../manager/actions";
import {
    fetchProjectsWithDatasetsAndTables,
    fetchOverviewSummary
} from "../metadata/actions";
import {fetchNotifications} from "../notifications/actions";
import {fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded} from "../services/actions";
import {fetchRuns} from "../wes/actions";
import { performGetGohanVariantsOverviewIfPossible } from "../explorer/actions";

import {LS_BENTO_WAS_SIGNED_IN} from "../../lib/auth/performAuth";
import {nop} from "../../utils/misc";


export const FETCHING_USER_DEPENDENT_DATA = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA");

export const fetchServiceDependentData = () => dispatch => Promise.all([
    fetchDropBoxTreeOrFail,
    fetchRuns,
    fetchNotifications,
    fetchOverviewSummary,
    performGetGohanVariantsOverviewIfPossible,
].map(a => dispatch(a())));

export const fetchUserDependentData = (servicesCb) => async (dispatch, getState) => {
    const {
        isFetchingDependentData,
        isFetchingDependentDataSilent,
        idTokenContents,
        hasAttempted,
    } = getState().auth;

    // If action is already being executed elsewhere, leave.
    if (isFetchingDependentData || isFetchingDependentDataSilent) return;

    // The reason this flow is only triggered the first time it is called
    // is because we want to silently check the user / auth status without
    // any loading indicators afterward.
    if (hasAttempted) return;

    dispatch(beginFlow(FETCHING_USER_DEPENDENT_DATA));
    try {
        if (idTokenContents) {
            await dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded(async () => {
                // We're newly authenticated as an owner, so run all actions that need authentication.
                await dispatch(fetchServiceDependentData());
            }));
            await (servicesCb || nop)();
            await dispatch(fetchProjectsWithDatasetsAndTables());  // TODO: If needed, remove if !hasAttempted
        }
    } finally {
        dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
    }
};

export const FETCH_OPENID_CONFIGURATION = createNetworkActionTypes("FETCH_OPENID_CONFIGURATION");
export const fetchOpenIdConfigurationIfNeeded = () => async (dispatch, getState) => {
    const {isFetching, data: existingData} = getState().openIdConfiguration;
    if (isFetching || !!existingData) return;

    const err = () => {
        message.error("Could not fetch identity provider configuration");
        dispatch({type: FETCH_OPENID_CONFIGURATION.ERROR});
    };

    dispatch({type: FETCH_OPENID_CONFIGURATION.REQUEST});

    const res = await fetch(OPENID_CONFIG_URL);
    let data = null;

    try {
        if (res.ok) {
            data = await res.json();
            dispatch({type: FETCH_OPENID_CONFIGURATION.RECEIVE, data});
        } else {
            console.error("Received non-200 request while fetching OpenID configuration", res);
            err();
        }
    } catch (e) {
        console.error("Received error while fetching OpenID configuration:", e);
        err();
    }

    dispatch({type: FETCH_OPENID_CONFIGURATION.FINISH});

    return data;
};

const buildUrlEncodedFormData = obj =>
    Object.entries(obj).reduce((params, [k, v]) => params.set(k, v) || params, new URLSearchParams());

const setLSNotSignedIn = () => {
    localStorage.removeItem(LS_BENTO_WAS_SIGNED_IN);
};

// noinspection JSUnusedGlobalSymbols
const tokenSuccessError = {
    onSuccess: () => {
        localStorage.setItem(LS_BENTO_WAS_SIGNED_IN, "true");
    },
    onError: setLSNotSignedIn,
};

// Action to do the initial handoff of an authorization code for an access token
export const TOKEN_HANDOFF = createNetworkActionTypes("TOKEN_HANDOFF");
export const tokenHandoff = networkAction((code, verifier) => (_dispatch, getState) => ({
    types: TOKEN_HANDOFF,
    url: getState().openIdConfiguration.data?.["token_endpoint"],
    ...tokenSuccessError,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: buildUrlEncodedFormData({
            grant_type: "authorization_code",
            code,
            client_id: CLIENT_ID,
            redirect_uri: AUTH_CALLBACK_URL,
            code_verifier: verifier,
        }),
    },
}));

// Action to renew access/refresh tokens
// TODO: handle session expiry / refresh token expiry
export const REFRESH_TOKENS = createNetworkActionTypes("REFRESH_TOKENS");
export const refreshTokens = networkAction(() => (_dispatch, getState) => ({
    types: REFRESH_TOKENS,
    url: getState().openIdConfiguration.data?.["token_endpoint"],
    ...tokenSuccessError,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: buildUrlEncodedFormData({
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            refresh_token: getState().auth.refreshToken,
        }),
    },
}));

export const SIGN_OUT = "SIGN_OUT";
export const signOut = () => {
    setLSNotSignedIn();
    return {type: SIGN_OUT};
};
