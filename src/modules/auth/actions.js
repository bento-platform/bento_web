import {
    beginFlow,
    createFlowActionTypes,
    createNetworkActionTypes,
    endFlow,
    networkAction
} from "../../utils/actions";

import {fetchServiceLogsIfPossible, fetchSystemLogsIfPossible} from "../logs/actions";
import {fetchDropBoxTreeOrFail} from "../manager/actions";
import {
    fetchExperiments,
    fetchProjectsWithDatasetsAndTables,
    fetchVariantTableSummaries,
    fetchOverviewSummary
} from "../metadata/actions";
import {fetchNodeInfo} from "../node/actions";
import {fetchNotifications} from "../notifications/actions";
import {fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded} from "../services/actions";
import {fetchRuns} from "../wes/actions";
import {nop} from "../../utils/misc";
import {withBasePath} from "../../utils/url";

export const SET_USER = "SET_USER";

export const FETCH_USER = createNetworkActionTypes("FETCH_USER");
export const FETCHING_USER_DEPENDENT_DATA = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA");

export const fetchUser = networkAction(() => ({
    types: FETCH_USER,
    url: withBasePath("api/auth/user")
}));

const fetchAndReturnUser = () => async (dispatch, getState) => {
    await dispatch(fetchUser());
    return getState().auth.user;
};

const setUser = user => ({
    type: SET_USER,
    data: user,
});

export const setAndReturnUser = user => (dispatch, getState) => {
    dispatch(setUser(user));
    return getState().auth.user;
};

export const fetchDependentData = () => dispatch => Promise.all([
    dispatch(fetchDropBoxTreeOrFail()),
    dispatch(fetchServiceLogsIfPossible()),
    dispatch(fetchSystemLogsIfPossible()),
    dispatch(fetchRuns()),
    dispatch(fetchNotifications()),
    dispatch(fetchOverviewSummary()),
    dispatch(fetchExperiments()),
    dispatch(fetchVariantTableSummaries())
]);

// TODO: Rename this (also fetches node info)
export const fetchUserAndDependentData = servicesCb => dispatch =>
    dispatch(fetchDependentDataWithProvidedUser(servicesCb, fetchAndReturnUser()));

// TODO: Rename this (also fetches node info)
export const fetchDependentDataWithProvidedUser = (servicesCb, boundAction) => async (dispatch, getState) => {
    const oldState = getState().auth.user;
    const hasAttempted = getState().auth.hasAttempted;

    if (!hasAttempted) {
        dispatch(beginFlow(FETCHING_USER_DEPENDENT_DATA));

        // Fetch node info if it's the first time this has been run; node info doesn't really change.
        // The reason this flow is only triggered the first time it is called is because we want to silently check the
        // user / auth status without any loading indicators afterwards.
        await dispatch(fetchNodeInfo());
    }

    // Parameterize the getUser action so it can either return existing data or fetch it from the API.
    const newState = await dispatch(boundAction);

    if (!hasAttempted) {
        await dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded());
        await (servicesCb || nop)();
        await dispatch(fetchProjectsWithDatasetsAndTables());  // TODO: If needed, remove if !hasAttempted
    }

    if (newState === null
        || (oldState || {}).chord_user_role === newState.chord_user_role
        || newState.chord_user_role !== "owner") {
        if (!hasAttempted) dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
        return;
    }

    // Otherwise, we're newly authenticated as an owner, so run all actions that need authentication.
    await dispatch(fetchDependentData());

    if (!hasAttempted) dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
};
