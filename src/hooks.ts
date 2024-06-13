import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import Ajv, { SchemaObject } from "ajv";

import {
    RESOURCE_EVERYTHING,
    useAuthorizationHeader,
    useHasResourcePermission,
    useResourcePermissions,
    type Resource,
} from "bento-auth-js";

import { type RootState, useAppSelector } from "@/store";
import { useService } from "@/modules/services/hooks";
import { ARRAY_BUFFER_FILE_EXTENSIONS, BLOB_FILE_EXTENSIONS } from "@/components/display/FileDisplay";


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
    } = useSelector((state: RootState) => state.openIdConfiguration);

    // Need `=== false`, since if this is loaded from localStorage from a prior version, it'll be undefined and prevent
    // the page from showing.
    return openIdConfigHasAttempted === false || openIdConfigFetching;
};

export const useDropBoxFileContent = (filePath?: string) => {
    const file = useSelector((state: RootState) =>
        state.dropBox.tree.find((f: { filePath: string | undefined; }) => f?.filePath === filePath));
    const authHeader = useAuthorizationHeader();

    const [fileContents, setFileContents] = useState(null);

    const fileExt = filePath?.split(".").slice(-1)[0].toLowerCase();

    // fetch effect
    useEffect(() => {
        setFileContents(null);
        (async () => {
            if (!file || !fileExt) return;
            if (!file?.uri) {
                console.error(`Files: something went wrong while trying to load ${file?.name}`);
                return;
            }
            if (fileExt === "pdf") {
                console.error("Cannot retrieve PDF with useDropBoxFileContent");
                return;
            }

            try {
                const r = await fetch(file.uri, { headers: authHeader });
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
                    console.error(`Could not load file: ${r.body}`);
                }
            } catch (e) {
                console.error(e);
            }
        })();
    }, [file, fileExt, authHeader]);

    return fileContents;
};


export const useJsonSchemaValidator = (schema: SchemaObject, acceptFalsyValue: boolean) => {
    const ajv = new Ajv();
    return useCallback((rule: unknown, value: unknown) => {
        if (!schema) {
            return Promise.reject(new Error("No JSON schema provided, cannot validate."));
        }

        if (!value && acceptFalsyValue) {
            return Promise.resolve();
        }
        const valid = ajv.validate(schema, value);

        if (valid) {
            return Promise.resolve();
        } else {
            return Promise.reject(new Error(ajv.errorsText(ajv.errors)));
        }

    }, [ajv, schema]);
};

export const useDiscoveryValidator = () => {
    const discoverySchema = useAppSelector(state => state.discovery.discoverySchema);
    return useJsonSchemaValidator(discoverySchema, true);
};

export const useDatsValidator = () => {
    // Simply verify that the file is a valid JSON object.
    // The backend will perform the more expensive validation
    const datsSchema = {
        "type": "object",
    };
    return useJsonSchemaValidator(datsSchema, false);
};
