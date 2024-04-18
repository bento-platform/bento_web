import { createNetworkActionTypes, networkAction } from "@/utils/actions";

export const FETCH_GRANTS = createNetworkActionTypes("FETCH_GRANTS");
const _fetchGrants = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GRANTS,
    url: `${getState().services.itemsByKind.authorization.url}/grants/`,
}));
export const fetchGrants = () => (dispatch, getState) => {
    if (!getState().services.itemsByKind.authorization
        || getState().grants.isFetching
        || getState().grants.data.length) return Promise.resolve();
    return dispatch(_fetchGrants());
};


export const FETCH_GROUPS = createNetworkActionTypes("FETCH_GROUPS");
const _fetchGroups = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GROUPS,
    url: `${getState().services.itemsByKind.authorization.url}/groups/`,
}));
export const fetchGroups = () => (dispatch, getState) => {
    if (!getState().services.itemsByKind.authorization
        || getState().groups.isFetching
        || getState().groups.data.length) return Promise.resolve();
    return dispatch(_fetchGroups());
};
