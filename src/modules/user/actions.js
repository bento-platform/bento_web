import { beginFlow, createFlowActionTypes, endFlow } from "@/utils/actions";
import { nop } from "@/utils/misc";
import { fetchDatasetsDataTypes } from "../datasets/actions";
import { fetchExtraPropertiesSchemaTypes, fetchProjectsWithDatasets } from "../metadata/actions";
import { fetchServicesWithMetadataAndDataTypesIfNeeded } from "../services/actions";

export const FETCHING_USER_DEPENDENT_DATA = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA");

export const fetchServiceDependentData = () => (dispatch) =>
  Promise.all([fetchExtraPropertiesSchemaTypes].map((a) => dispatch(a())));

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
      // If we're newly authenticated as an owner, we run all actions that may have changed with authentication
      // (via the callback).
      // TODO: invalidate projects/datasets/other user-dependent data
      await dispatch(fetchServicesWithMetadataAndDataTypesIfNeeded(() => dispatch(fetchServiceDependentData())));
      await (servicesCb || nop)();
      await dispatch(fetchProjectsWithDatasets());
      await dispatch(fetchDatasetsDataTypes());
    }
  } finally {
    dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
  }
};
