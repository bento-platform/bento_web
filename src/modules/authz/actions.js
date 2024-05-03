import { message } from "antd";
import { basicAction, createNetworkActionTypes, networkAction } from "@/utils/actions";
import { jsonRequest } from "@/utils/requests";

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


const authzMutateCheck = (reducer) => (state) => {
    const { isFetching, isCreating, isDeleting, isInvalid } = state[reducer];
    return authzService(state) && !isFetching && !isCreating && !isDeleting && !isInvalid;
};


const grantMutateCheck = authzMutateCheck("grants");

export const FETCH_GRANTS = createNetworkActionTypes("FETCH_GRANTS");
export const fetchGrants = networkAction(() => (_dispatch, getState) => ({
    types: FETCH_GRANTS,
    check: (state) => {
        const { data, isFetching, isCreating, isDeleting, isInvalid } = state.grants;
        return authzService(state) && !isFetching && !isCreating && !isDeleting && (!data.length || isInvalid);
    },
    url: `${authzURL(getState())}/grants/`,
}));

export const INVALIDATE_GRANTS = "INVALIDATE_GRANTS";
export const invalidateGrants = basicAction(INVALIDATE_GRANTS);

export const CREATE_GRANT = createNetworkActionTypes("CREATE_GRANT");
export const createGrant = networkAction((grant) => (_dispatch, getState) => ({
    types: CREATE_GRANT,
    check: grantMutateCheck,
    req: jsonRequest(grant, "POST"),
    url: `${authzURL(getState())}/grants/`,
    onSuccess: () => {
        message.success("Grant created successfully!");
    },
}));

export const DELETE_GRANT = createNetworkActionTypes("DELETE_GRANT");
export const deleteGrant = networkAction(({ id: grantID }) => (_dispatch, getState) => ({
    types: DELETE_GRANT,
    check: grantMutateCheck,
    req: { method: "DELETE" },
    url: `${authzURL(getState())}/grants/${grantID}`,
    params: { grantID },
    onSuccess: () => {
        message.success(`Grant ${grantID} deleted successfully!`);
    },
}));


const groupMutateCheck = authzMutateCheck("groups");

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

export const CREATE_GROUP = createNetworkActionTypes("CREATE_GROUP");
export const createGroup = networkAction((group) => (_dispatch, getState) => ({
    types: CREATE_GROUP,
    check: groupMutateCheck,
    req: jsonRequest(group, "POST"),
    url: `${authzURL(getState())}/groups/`,
    onSuccess: () => {
        message.success(`Group "${group.name}" created successfully!`);
    },
}));

export const DELETE_GROUP = createNetworkActionTypes("DELETE_GROUP");
export const deleteGroup = networkAction((group) => (dispatch, getState) => ({
    types: DELETE_GROUP,
    check: groupMutateCheck,
    req: { method: "DELETE" },
    url: `${authzURL(getState())}/groups/${group.id}`,
    params: { groupID: group.id },
    onSuccess: () => {
        message.success(`Group "${group.name}" (ID: ${group.id}) and associated grants deleted successfully!`);
        // Group deletion can cascade to grants, so invalidate them to trigger re-fetch:
        return dispatch(invalidateGrants());
    },
}));
