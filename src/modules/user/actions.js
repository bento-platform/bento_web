import {fetchDropBoxTreeOrFail} from "../manager/actions";
import {fetchRuns} from "../wes/actions";
import {fetchNotifications} from "../notifications/actions";
import {fetchOverviewSummary, fetchProjectsWithDatasetsAndTables} from "../metadata/actions";
import {performGetGohanVariantsOverviewIfPossible} from "../explorer/actions";
import {beginFlow, createFlowActionTypes, endFlow} from "../../utils/actions";
import {fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded} from "../services/actions";
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
            // If we're newly authenticated as an owner, we run all actions that need authentication (via the callback).
            await dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded(
                () => dispatch(fetchServiceDependentData())));
            await (servicesCb || nop)();
            await dispatch(fetchProjectsWithDatasetsAndTables());  // TODO: If needed, remove if !hasAttempted
        }
    } finally {
        dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
    }
};