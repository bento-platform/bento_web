import { createNetworkActionTypes, networkAction } from "../../utils/actions";

export const FETCH_GRANTS = createNetworkActionTypes("FETCH_GRANTS");
const fetchGrants = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GRANTS,
    url: `${getState().services.itemsByKind.authorization.url}/grants/`,
}));
export const fetchGrantsIfNeeded = () => (dispatch, getState) => {
    if (getState().grants.isFetching || getState().grants.data.length) return;
    return dispatch(fetchGrants());
};


export const FETCH_GROUPS = createNetworkActionTypes("FETCH_GROUPS");
const fetchGroups = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GROUPS,
    url: `${getState().services.itemsByKind.authorization.url}/groups/`,
}));
export const fetchGroupsIfNeeded = () => (dispatch, getState) => {
    if (getState().groups.isFetching || getState().groups.data.length) return;
    return dispatch(fetchGroups());
};
