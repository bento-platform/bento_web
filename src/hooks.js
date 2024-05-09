import { useHasResourcePermission, useResourcePermissions } from "bento-auth-js";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useAuthorizationHeader } from "../node_modules/bento-auth-js/dist/hooks";
import { ARRAY_BUFFER_FILE_EXTENSIONS, BLOB_FILE_EXTENSIONS } from "./components/display/FileDisplay";
import { object } from "prop-types";
import { nop } from "./utils/misc";
import Ajv from "ajv";

const ajv = new Ajv();

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
 * @param {Record<string, string | boolean>} resource The resource object (e.g. {"everything": true})
 * @param {string} permission The permission string (e.g. "view:drop_box")
 * @returns {ResourcePermissionEval}
 */
export const useHasResourcePermissionWrapper = (resource, permission) => {
    const authzUrl = useSelector((state) => state.services.itemsByKind?.authorization?.url);

    const { isFetching: fetchingPermission, hasPermission } = useHasResourcePermission(resource, authzUrl, permission);

    return {
        fetchingPermission,
        hasPermission,
    };
};

/**
 * Returns the user's permissions for a given resource
 * @param {Record<string, string | boolean>} resource The resource (e.g. {"everything": true})
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

export const useDropBoxFileContent = (filePath) => {
    const file = useSelector((state) => state.dropBox.tree.find((f) => f.filePath === filePath));
    const authHeader = useAuthorizationHeader();

    const [fileContents, setFileContents] = useState(null);

    const fileExt = filePath ? filePath.split(".").slice(-1)[0].toLowerCase() : null;

    // fetch effect
    useEffect(() => {
        setFileContents(null);
        (async () => {
            if (!file) return;
            if (!file?.uri) {
                console.error(`Files: something went wrong while trying to load ${uri}`);
                return;
            }
            if (fileExt === "pdf") {
                console.error("Cannot retrieve PDF with useDropBoxFileContent")
                return
            }

            try {
                const r = await fetch(file.uri, { headers: authHeader })
                if (r.ok) {
                    let content;
                    if (ARRAY_BUFFER_FILE_EXTENSIONS.includes(fileExt)) {
                        content = await r.arrayBuffer();
                    } else if (BLOB_FILE_EXTENSIONS.includes(fileExt)) {
                        content = await r.blob();
                    } else {
                        const text = await r.text();
                        content = (fileExt === "json" ? JSON.parse(text) : text);
                    }
                    setFileContents(content);
                } else {
                    console.error(`Could not load file: ${r.content}`);
                }
            } catch (e) {
                console.error(e);
            }
        })();
    }, [file, fileExt, authHeader]);

    return fileContents;
};

export const useValidateJsonSchema = (data, schemaStateSelector) => {
    const jsonSchema = useSelector(schemaStateSelector);
    return useMemo(() => ajv.validate(jsonSchema, data), [data, jsonSchema]);
}
