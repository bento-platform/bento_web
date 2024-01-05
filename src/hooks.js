import { useHasResourcePermission, useResourcePermissions } from "bento-auth-js";
import { useMemo } from "react";
import { useSelector } from "react-redux";

// WORKFLOW:

export const useWorkflows = () => {
    const isFetchingAllServices = useSelector((state) => state.services.isFetchingAll);
    const isFetchingServiceWorkflows = useSelector((state) => state.serviceWorkflows.isFetching);

    const workflowsLoading = isFetchingAllServices || isFetchingServiceWorkflows;

    const serviceWorkflows = useSelector((state) => state.serviceWorkflows.items);

    return useMemo(() => {
        const workflowsByType = {
            ingestion: { items: [], itemsByID: {} },
            analysis: { items: [], itemsByID: {} },
            export: { items: [], itemsByID: {} },
        };

        Object.entries(serviceWorkflows).forEach(([workflowType, workflowTypeWorkflows]) => {
            if (!(workflowType in workflowsByType)) return;

            // noinspection JSCheckFunctionSignatures
            Object.entries(workflowTypeWorkflows).forEach(([k, v]) => {
                const wf = { ...v, id: k };
                workflowsByType[workflowType].items.push(wf);
                workflowsByType[workflowType].itemsByID[k] = wf;
            });
        });

        return { workflowsByType, workflowsLoading };
    }, [serviceWorkflows, workflowsLoading]);
};

// AUTHORIZATION:
// Wrapper hooks for bento-auth-js permissions hooks, which expect a 'authzUrl' argument.
// bento-auth-js does not assume that the 'authzUrl' is accessible from the store (left to the client app to provide).
// These wrapper hooks grab the 'authzUrl' from the store's services.

/**
 * The evaluation of a user permission for a given resource.
 * @typedef {Object} ResourcePermissionEval
 * @property {boolean} fetchingPermission Indicates the permission is being fetched from the authz service.
 * @property {boolean} hasPermission Indicates the user has the requested resource permission.
 */

/**
 * The user permissions for a given resource
 * @typedef {Object} ResourcePermissions
 * @property {string[]} permissions The list of permissions the user has on the resource
 * @property {boolean} isFetchingPermissions Indicates if the permissions are being fetched.
 * @property {boolean} hasAttemptedPermissions Indicates if a permissions fetch was attempted.
 */

/**
 * Evaluate if the user has a permission on a given resource
 * @param {Object} resource The resource key (e.g. "everything")
 * @param {string} permission The permission string (e.g. "view:drop_box")
 * @returns {ResourcePermissionEval}
 */
export const useHasResourcePermissionWrapper = (resource, permission) => {
    const authzUrl = useSelector((state) => state.services.itemsByKind?.authorization?.url);

    const {isFetching: fetchingPermission, hasPermission} = useHasResourcePermission(resource, authzUrl, permission);

    return {
        fetchingPermission,
        hasPermission,
    };
};

/**
 * Returns the user's permissions for a given resource
 * @param {string} resource The resource (e.g. "everything")
 * @returns {ResourcePermissions}
 */
export const useResourcePermissionsWrapper = (resource) => {
    const authzUrl = useSelector((state) => state.services.itemsByKind?.authorization?.url);

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
