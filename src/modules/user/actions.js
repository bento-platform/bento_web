import { beginFlow, createFlowActionTypes, endFlow } from "../../utils/actions";
import { fetchDropBoxTreeOrFail } from "../manager/actions";
import { fetchRuns } from "../wes/actions";
import { fetchNotifications } from "../notifications/actions";
import { fetchExtraPropertiesSchemaTypes, fetchOverviewSummary, fetchProjectsWithDatasets } from "../metadata/actions";
import { performGetGohanVariantsOverviewIfPossible } from "../explorer/actions";
import { fetchServicesWithMetadataAndDataTypesIfNeeded } from "../services/actions";
import { nop } from "../../utils/misc";
import { fetchDatasetsDataTypes } from "../datasets/actions";

export const FETCHING_USER_DEPENDENT_DATA = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA");

export const fetchServiceDependentData = () => (dispatch) =>
    Promise.all(
        [
            fetchDropBoxTreeOrFail,
            fetchRuns,
            fetchNotifications,
            fetchOverviewSummary,
            performGetGohanVariantsOverviewIfPossible,
            fetchExtraPropertiesSchemaTypes,
        ].map((a) => dispatch(a())),
    );

export const fetchUserDependentData = (servicesCb) => async (dispatch, getState) => {
    const { idTokenContents, hasAttempted } = getState().auth;
    const { isFetchingDependentData } = getState().user;

    // If action is already being executed elsewhere, leave.
    if (isFetchingDependentData) return;

    // The reason this flow is only triggered the first time it is called
    // is because we want to silently check the user / auth status without
    // any loading indicators afterward.
    if (hasAttempted) return;

    dispatch(beginFlow(FETCHING_USER_DEPENDENT_DATA));
    try {
        if (idTokenContents) {
            // If we're newly authenticated as an owner, we run all actions that need authentication (via the callback).
            await dispatch(fetchServicesWithMetadataAndDataTypesIfNeeded(() => dispatch(fetchServiceDependentData())));
            await (servicesCb || nop)();
            await dispatch(fetchProjectsWithDatasets());
            await dispatch(fetchDatasetsDataTypes());
        }
    } finally {
        dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
    }
};
