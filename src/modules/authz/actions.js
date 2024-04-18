import { createNetworkActionTypes, networkAction } from "@/utils/actions";

export const FETCH_GRANTS = createNetworkActionTypes("FETCH_GRANTS");
export const fetchGrants = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GRANTS,
    check: (state) => state.services.itemsByKind.authorization
        && !state.grants.isFetching
        && !state.grants.data.length,
    url: `${getState().services.itemsByKind.authorization.url}/grants/`,
}));


export const FETCH_GROUPS = createNetworkActionTypes("FETCH_GROUPS");
export const fetchGroups = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GROUPS,
    check: (state) => state.services.itemsByKind.authorization
        && !state.groups.isFetching
        && !state.groups.data.length,
    url: `${getState().services.itemsByKind.authorization.url}/groups/`,
}));
