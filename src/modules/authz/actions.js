import { message } from "antd";
import { basicAction, createNetworkActionTypes, networkAction } from "@/utils/actions";

const authzService = (state) => state.services.itemsByKind.authorization;
const authzURL = (state) => authzService(state).url;


// FETCH_ALL_PERMISSIONS: fetch list of available permissions (not on a specific resource/subject, but in general what
//   permissions are defined.
export const FETCH_ALL_PERMISSIONS = createNetworkActionTypes("FETCH_ALL_PERMISSIONS");
export const fetchAllPermissions = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_ALL_PERMISSIONS,
    check: (state) => !state.allPermissions.isFetching && !state.allPermissions.data.length,
    url: `${authzURL(getState())}/all_permissions/`,
    publicEndpoint: true,
}));


export const FETCH_GRANTS = createNetworkActionTypes("FETCH_GRANTS");
export const fetchGrants = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GRANTS,
    check: (state) => {
        const { data, isFetching, isInvalid } = state.grants;
        return authzService(state) && !isFetching && (!data.length || isInvalid);
    },
    url: `${authzURL(getState())}/grants/`,
}));

export const INVALIDATE_GRANTS = "INVALIDATE_GRANTS";
export const invalidateGrants = basicAction(INVALIDATE_GRANTS);

export const DELETE_GRANT = createNetworkActionTypes("DELETE_GRANT");
export const deleteGrant = networkAction(({ id: grantID }) => (_dispatch, getState) => ({
    types: DELETE_GRANT,
    check: (state) => {
        const { isFetching, isDeleting, isInvalid } = state.grants;
        return state.services.itemsByKind.authorization && !isFetching && !isDeleting && !isInvalid;
    },
    req: { method: "DELETE" },
    url: `${authzURL(getState())}/grants/${grantID}`,
    params: { grantID },
    onSuccess: () => {
        message.success(`Grant ${grantID} deleted successfully!`);
    },
}));


export const FETCH_GROUPS = createNetworkActionTypes("FETCH_GROUPS");
export const fetchGroups = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GROUPS,
    check: (state) => authzService(state)
        && !state.groups.isFetching
        && (!state.groups.data.length || state.groups.isInvalid),
    url: `${authzURL(getState())}/groups/`,
}));

export const INVALIDATE_GROUPS = "INVALIDATE_GROUPS";
export const invalidateGroups = basicAction(INVALIDATE_GROUPS);

export const DELETE_GROUP = createNetworkActionTypes("DELETE_GROUP");
export const deleteGroup = networkAction((group) => (dispatch, getState) => ({
    types: DELETE_GROUP,
    check: (state) => authzService(state) && !state.groups.isFetching && !state.groups.isDeleting
        && !state.groups.isInvalid,
    req: { method: "DELETE" },
    url: `${authzURL(getState())}/groups/${group.id}`,
    params: { groupID: group.id },
    onSuccess: () => {
        message.success(`Group "${group.name}" (ID: ${group.id}) and associated grants deleted successfully!`);
        // Group deletion can cascade to grants, so invalidate them to trigger re-fetch:
        return dispatch(invalidateGrants());
    },
}));
