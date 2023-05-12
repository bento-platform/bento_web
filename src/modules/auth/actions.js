import {message} from "antd";

import {OPENID_CONFIG_URL} from "../../config";

import {
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

import {nop} from "../../utils/misc";
import {withBasePath} from "../../utils/url";


export const SET_USER = "SET_USER";

export const FETCH_USER = createNetworkActionTypes("FETCH_USER");
export const FETCHING_USER_DEPENDENT_DATA = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA");
export const FETCHING_USER_DEPENDENT_DATA_SILENT = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA_SILENT");

export const fetchUser = networkAction(() => ({
    types: FETCH_USER,
    url: withBasePath("api/auth/user")
}));

export const setUser = user => ({
    type: SET_USER,
    data: user,
});

export const fetchServiceDependentData = () => dispatch => Promise.all([
    fetchDropBoxTreeOrFail,
    fetchRuns,
    fetchNotifications,
    fetchOverviewSummary,
    performGetGohanVariantsOverviewIfPossible,
].map(a => dispatch(a())));

// TODO: Rename this (also fetches node info)
export const fetchUserAndDependentData = servicesCb => dispatch =>
    dispatch(fetchDependentDataWithProvidedUser(servicesCb, fetchUser()));

// TODO: Rename this (also fetches node info)
export const fetchDependentDataWithProvidedUser = (servicesCb, boundUserGetAction) => async (dispatch, getState) => {
    const {
        isFetchingDependentData,
        isFetchingDependentDataSilent,
        user: oldUserState,
        hasAttempted,
    } = getState().auth;

    // If action is already being executed elsewhere, leave.
    if (isFetchingDependentData || isFetchingDependentDataSilent) return;

    if (!hasAttempted) {
        dispatch(beginFlow(FETCHING_USER_DEPENDENT_DATA));
        // The reason this flow is only triggered the first time it is called
        // is because we want to silently check the user / auth status without
        // any loading indicators afterward.
    } else {
        dispatch(beginFlow(FETCHING_USER_DEPENDENT_DATA_SILENT));
    }

    // Parameterize the (bound) action which sets the new user state, so it
    // can either set already fetched data or fetch it from the API itself.
    await dispatch(boundUserGetAction);
    const newUserState = getState().auth.user;

    // If this is false, we either didn't change state (in which case we've handled stuff before)
    // or are not an owner, and so should not try to fetch authenticated data.
    // TODO: Actual roles/logic for access
    const shouldUpdateUserDependentData = !(newUserState?.chord_user_role !== "owner"
        || oldUserState?.chord_user_role === newUserState?.chord_user_role);

    if (!hasAttempted) {
        await dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded(async () => {
            if (shouldUpdateUserDependentData) {
                // We're newly authenticated as an owner, so run all actions that need authentication.
                await dispatch(fetchServiceDependentData());
            }
        }));
        await (servicesCb || nop)();
        await dispatch(fetchProjectsWithDatasetsAndTables());  // TODO: If needed, remove if !hasAttempted
    }

    if (!hasAttempted) {
        dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
    } else {
        dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA_SILENT));
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

// Action to do the initial handoff of an authorization code for an access token
export const TOKEN_HANDOFF = createNetworkActionTypes("TOKEN_HANDOFF");
export const tokenHandoff = networkAction((tokenEndpoint, body) => ({
    types: TOKEN_HANDOFF,
    url: tokenEndpoint,
    req: {method: "POST", body},
}));
