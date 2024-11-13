import { fetchDatasetsDataTypes } from "@/modules/datasets/actions";
import { fetchProjectsWithDatasets, invalidateProjects } from "@/modules/metadata/actions";
import { fetchServicesWithMetadataAndDataTypesIfNeeded } from "@/modules/services/actions";
import type { AppDispatch, RootState } from "@/store";
import { beginFlow, createFlowActionTypes, endFlow } from "@/utils/actions";
import { nop } from "@/utils/misc";

export const FETCHING_USER_DEPENDENT_DATA = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA");

export const fetchUserDependentData =
  (servicesCb: (() => unknown) | (() => Promise<unknown>) | undefined = undefined) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
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
        // If we're newly authenticated as an owner, we run all actions that may have changed with authentication
        // (via the callback).
        // TODO: invalidate other user-dependent data
        dispatch(invalidateProjects());
        await dispatch(fetchServicesWithMetadataAndDataTypesIfNeeded());
        await (servicesCb || nop)();
        await dispatch(fetchProjectsWithDatasets());
        await dispatch(fetchDatasetsDataTypes());
      }
    } finally {
      dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
    }
  };
