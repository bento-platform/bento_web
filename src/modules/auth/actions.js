import { message } from "antd";

import { AUTH_CALLBACK_URL, CLIENT_ID, OPENID_CONFIG_URL } from "../../config";

import {
    beginFlow,
    createFlowActionTypes,
    createNetworkActionTypes,
    endFlow,
    networkAction,
} from "../../utils/actions";

import { fetchDatasetDataTypesSummaryIfPossible } from "../../modules/datasets/actions";
import { fetchDropBoxTreeOrFail } from "../manager/actions";
import {
    fetchProjectsWithDatasets,
    fetchOverviewSummary,
    fetchExtraPropertiesSchemaTypes,
} from "../metadata/actions";
import { fetchNotifications } from "../notifications/actions";
import { fetchServicesWithMetadataAndDataTypesIfNeeded } from "../services/actions";
import { fetchRuns } from "../wes/actions";
import { performGetGohanVariantsOverviewIfPossible } from "../explorer/actions";

import { LS_BENTO_WAS_SIGNED_IN, setLSNotSignedIn } from "../../lib/auth/performAuth";
import { buildUrlEncodedData } from "../../lib/auth/utils";
import { nop } from "../../utils/misc";
import { jsonRequest } from "../../utils/requests";
import { makeResourceKey } from "../../lib/auth/resources";


export const FETCHING_USER_DEPENDENT_DATA = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA");

export const fetchServiceDependentData = () => dispatch => Promise.all([
    fetchDropBoxTreeOrFail,
    fetchRuns,
    fetchNotifications,
    fetchOverviewSummary,
    performGetGohanVariantsOverviewIfPossible,
    fetchExtraPropertiesSchemaTypes,
].map(a => dispatch(a())));

const getDatasetsByID = (state) => Object.fromEntries(
    state.projects.items.flatMap((p) =>
        p.datasets.map((d) => [d.identifier, { ...d, project: p.identifier }],
        )),
);

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
            // If we're newly authenticated as an owner, we run all actions that need authentication (via the callback).
            await dispatch(fetchServicesWithMetadataAndDataTypesIfNeeded(
                () => dispatch(fetchServiceDependentData())));
            await (servicesCb || nop)();
            await dispatch(fetchProjectsWithDatasets());  // TODO: If needed, remove if !hasAttempted
            const state = getState();
            const datasetsByID = getDatasetsByID(state);
            const fetchAllDatasets = Object.keys(datasetsByID).map(datasetIdentifier =>
                dispatch(fetchDatasetDataTypesSummaryIfPossible(datasetIdentifier)));
            await Promise.all(fetchAllDatasets);
        }
    } finally {
        dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
    }
};

export const FETCH_OPENID_CONFIGURATION = createNetworkActionTypes("FETCH_OPENID_CONFIGURATION");
export const fetchOpenIdConfigurationIfNeeded = () => async (dispatch, getState) => {
    const {isFetching, data: existingData, expiry} = getState().openIdConfiguration;
    if (isFetching || (!!existingData && expiry && Date.now() < expiry * 1000)) return;

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
        body: buildUrlEncodedData({
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
const refreshTokens = networkAction(() => (_dispatch, getState) => ({
    types: REFRESH_TOKENS,
    url: getState().openIdConfiguration.data?.["token_endpoint"],
    ...tokenSuccessError,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: buildUrlEncodedData({
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            refresh_token: getState().auth.refreshToken,
        }),
    },
}));
export const refreshTokensIfPossible = () => (dispatch, getState) => {
    // If refresh token is null, it has been invalidated or was never fetched, so we cannot refresh the session.
    if (!getState().auth.refreshToken) return;
    return dispatch(refreshTokens());
};

export const SIGN_OUT = "SIGN_OUT";
export const signOut = () => {
    setLSNotSignedIn();
    return {type: SIGN_OUT};
};

export const FETCH_RESOURCE_PERMISSIONS = createNetworkActionTypes("FETCH_RESOURCE_PERMISSIONS");
const fetchResourcePermissions = networkAction((resource) => (_dispatch, getState) => ({
    types: FETCH_RESOURCE_PERMISSIONS,
    url: `${getState().services.itemsByKind.authorization.url}/policy/permissions`,
    req: jsonRequest({requested_resource: resource}, "POST"),
    params: {resource},
}));
export const fetchResourcePermissionsIfPossibleAndNeeded = (resource) => (dispatch, getState) => {
    if (!getState().services.itemsByKind.authorization?.url) {
        console.error("Missing authorization service");
        return;
    }
    const key = makeResourceKey(resource);
    const rp = getState().auth.resourcePermissions[key];
    if (rp?.isFetching || rp?.permissions) {
        return;
    }
    return dispatch(fetchResourcePermissions(resource));
};

// TODO: invalidation action for specific resource permissions
