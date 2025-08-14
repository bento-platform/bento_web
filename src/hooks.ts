import { useCallback, useEffect, useMemo } from "react";
import Ajv, { type SchemaObject } from "ajv";
import addFormats from "ajv-formats";

import {
  RESOURCE_EVERYTHING,
  useHasResourcePermission,
  useResourcePermissions,
  type Resource,
  useOpenIdConfig,
} from "bento-auth-js";

import { AJV_OPTIONS } from "@/constants";
import { useService } from "@/modules/services/hooks";
import { Exception } from "handlebars";

// AUTHORIZATION:
// Wrapper hooks for bento-auth-js permissions hooks, which expect a 'authzUrl' argument.
// bento-auth-js does not assume that the 'authzUrl' is accessible from the store (left to the client app to provide).
// These wrapper hooks grab the 'authzUrl' from the store's services.

export type ResourcePermissionEval = {
  fetchingPermission: boolean; // Indicates the permission is being fetched from the authz service.
  hasPermission: boolean; // Indicates the user has the requested resource permission.
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
  permissions: string[]; // The list of permissions the user has on the resource
  isFetchingPermissions: boolean; // Indicates if the permissions are being fetched.
  hasAttemptedPermissions: boolean; // Indicates if a permissions fetch was attempted.
  error: string; // String, which is non-blank if an error occurred during permissions fetch.
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
    error,
  } = useResourcePermissions(resource, authzUrl);

  useEffect(() => {
    if (error) {
      console.error("useResourcePermissionsWrapper encountered error", error, "| resource:", resource);
    }
  }, [error, resource]);

  return {
    permissions,
    isFetchingPermissions,
    hasAttemptedPermissions,
    error,
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
  const { hasAttempted: openIdConfigHasAttempted, isFetching: openIdConfigFetching } = useOpenIdConfig();

  // Need `=== false`, since if this is loaded from localStorage from a prior version, it'll be undefined and prevent
  // the page from showing.
  // noinspection PointlessBooleanExpressionJS
  return openIdConfigHasAttempted === false || openIdConfigFetching;
};

export const useJsonSchemaValidator = (schema: SchemaObject, schemaName: string, acceptFalsyValue: boolean) => {
  const ajv = useMemo(() => {
    if (schema) {
      // for schemas obtained by API: only instantiate Ajv when the schema is resolved
      return addFormats(new Ajv(AJV_OPTIONS)).addSchema(schema, schemaName);
    }
  }, [schema, schemaName]);
  return useCallback(
    (rule: unknown, value: unknown) => {
      var validator
      try {
        // TODO: why is this throwing?
        validator = ajv?.getSchema(schemaName);
      } catch (e) {
        console.debug(e);
        return Promise.resolve();
      }
      if (!ajv || !validator) {
        return Promise.reject(new Error(`No JSON schema provided for ${schemaName}, cannot validate.`));
      }

      if (!value && acceptFalsyValue) {
        return Promise.resolve();
      }

      if (validator(value)) {
        return Promise.resolve();
      } else {
        console.error(`schema validation errors (schema=${schemaName})`, validator.errors);
        return Promise.reject(new Error(ajv.errorsText(validator.errors)));
      }
    },
    [acceptFalsyValue, ajv, schemaName],
  );
};

export const useDatsValidator = () => {
  // Simply verify that the file is a valid JSON object.
  // The backend will perform the more expensive validation
  const datsSchema = {
    type: "object",
  };
  return useJsonSchemaValidator(datsSchema, "dats", false);
};
