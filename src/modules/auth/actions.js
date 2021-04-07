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

export const setUser = user => ({
    type: SET_USER,
    data: user,
});

export const fetchDependentData = () => dispatch => Promise.all([
    fetchDropBoxTreeOrFail,
    fetchServiceLogsIfPossible,
    fetchSystemLogsIfPossible,
    fetchRuns,
    fetchNotifications,
    fetchOverviewSummary,
    fetchExperiments,
    fetchVariantTableSummaries,
].map(a => dispatch(a())));

// TODO: Rename this (also fetches node info)
export const fetchUserAndDependentData = servicesCb => dispatch =>
    dispatch(fetchDependentDataWithProvidedUser(servicesCb, fetchUser()));

// TODO: Rename this (also fetches node info)
export const fetchDependentDataWithProvidedUser = (servicesCb, boundUserGetAction) => async (dispatch, getState) => {
    const oldUserState = getState().auth.user;
    const hasAttempted = getState().auth.hasAttempted;

    if (!hasAttempted) {
        dispatch(beginFlow(FETCHING_USER_DEPENDENT_DATA));

        // Fetch node info if it's the first time this has been run; node info
        // doesn't really change.
        // The reason this flow is only triggered the first time it is called
        // is because we want to silently check the user / auth status without
        // any loading indicators afterwards.
        await dispatch(fetchNodeInfo());
    }

    // Parameterize the (bound) action which sets the new user state, so it
    // can either set already fetched data or fetch it from the API itself.
    await dispatch(boundUserGetAction);
    const newUserState = getState().auth.user;

    if (!hasAttempted) {
        await dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded());
        await (servicesCb || nop)();
        await dispatch(fetchProjectsWithDatasetsAndTables());  // TODO: If needed, remove if !hasAttempted
    }

    if (newUserState?.chord_user_role !== "owner"
        || oldUserState?.chord_user_role === newUserState?.chord_user_role) {
        // We either didn't change state (in which case we've handled stuff before) or are not an owner, and so
        // should not try to fetch authenticated data.
        // TODO: Actual roles for access
        if (!hasAttempted) dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
        return;
    }

    // Otherwise, we're newly authenticated as an owner, so run all actions that need authentication.
    await dispatch(fetchDependentData());

    if (!hasAttempted) dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
};
