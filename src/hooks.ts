import { useSelector } from "react-redux";

import { RESOURCE_EVERYTHING, useHasResourcePermission, useResourcePermissions } from "bento-auth-js";
import type { Resource } from "bento-auth-js";

import { useService } from "@/modules/services/hooks";

// AUTHORIZATION:
// Wrapper hooks for bento-auth-js permissions hooks, which expect a 'authzUrl' argument.
// bento-auth-js does not assume that the 'authzUrl' is accessible from the store (left to the client app to provide).
// These wrapper hooks grab the 'authzUrl' from the store's services.

export type ResourcePermissionEval = {
    fetchingPermission: boolean,  // Indicates the permission is being fetched from the authz service.
    hasPermission: boolean,  // Indicates the user has the requested resource permission.
};

/**
 * Evaluate if the user has a permission on a given resource
 */
export const useHasResourcePermissionWrapper = (resource: Resource, permission: string): ResourcePermissionEval => {
    const authzUrl = useService("authorization")?.url;

    const { isFetching: fetchingPermission, hasPermission } = useHasResourcePermission(resource, authzUrl, permission);

    return {
        fetchingPermission,
        hasPermission,
    };
};

export type ResourcePermissions = {
    permissions: string[],  // The list of permissions the user has on the resource
    isFetchingPermissions: boolean,  // Indicates if the permissions are being fetched.
    hasAttemptedPermissions: boolean,  // Indicates if a permissions fetch was attempted.
};

/**
 * Returns the user's permissions for a given resource
 */
export const useResourcePermissionsWrapper = (resource: Resource): ResourcePermissions => {
    const authzUrl = useService("authorization")?.url;

    const {
        permissions,
        isFetching: isFetchingPermissions,
        hasAttempted: hasAttemptedPermissions,
    } = useResourcePermissions(resource, authzUrl);

    return {
        permissions,
        isFetchingPermissions,
        hasAttemptedPermissions,
    };
};

/**
 * Returns the user's permissions for the node-wide permissions resource.
 */
export const useEverythingPermissions = () => useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

/**
 * Returns true if the OpenID config hasn't been loaded yet.
 */
export const useOpenIDConfigNotLoaded = (): boolean => {
    const {
        hasAttempted: openIdConfigHasAttempted,
        isFetching: openIdConfigFetching,
        // @ts-ignore
    } = useSelector((state) => state.openIdConfiguration);

    // Need `=== false`, since if this is loaded from localStorage from a prior version, it'll be undefined and prevent
    // the page from showing.
    return openIdConfigHasAttempted === false || openIdConfigFetching;
};
