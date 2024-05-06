import { useEffect, useMemo } from "react";

import {
    analyzeData,
    createDataset,
    createProject,
    deleteData,
    deleteProject,
    editDataset,
    editPermissions,
    editProject,
    exportData,
    ingestData,
    ingestReferenceMaterial,
    makeResourceKey,
    queryData,
    RESOURCE_EVERYTHING,
    useResourcesPermissions,
    viewDropBox,
    viewPermissions,
    viewRuns,
} from "bento-auth-js";

import { useEverythingPermissions } from "@/hooks";
import { useProjectsAndDatasetsAsAuthzResources } from "@/modules/metadata/hooks";
import { useService } from "@/modules/services/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAllPermissions, fetchGrants, fetchGroups } from "./actions";

export const useProjectDatasetPermissions = () => {
    const authz = useService("authorization");
    const projectDatasetResources = useProjectsAndDatasetsAsAuthzResources();
    return useResourcesPermissions(projectDatasetResources, authz?.url);
};

const RESOURCE_EVERYTHING_KEY = makeResourceKey(RESOURCE_EVERYTHING);

const PROJECT_DATASET_QUERY_PERMISSIONS = [queryData];
const PROJECT_DATASET_MANAGEMENT_PERMISSIONS = [
    createProject,
    createDataset,
    editProject,
    editDataset,
    deleteProject,
    deleteData,
    ingestData,
];

const _hasOneOfListedPermissions = (permissionList, permissions) => permissionList.some((p) => permissions.includes(p));


// AUTHZ STATE HOOKS

export const useAllPermissions = () => {
    const dispatch = useAppDispatch();
    const authz = useService("authorization");

    useEffect(() => {
        dispatch(fetchAllPermissions()).catch((err) => console.error(err));
    }, [dispatch, authz]);

    return useAppSelector((state) => state.allPermissions);
};

export const useGrants = () => {
    const dispatch = useAppDispatch();
    const authz = useService("authorization");

    const grantsState = useAppSelector((state) => state.grants);

    useEffect(() => {
        dispatch(fetchGrants()).catch((err) => console.error(err));
    }, [dispatch, authz, grantsState.isInvalid]);

    return grantsState;
};

export const useGroups = () => {
    const dispatch = useAppDispatch();
    const authz = useService("authorization");

    const groupsState = useAppSelector((state) => state.groups);

    useEffect(() => {
        dispatch(fetchGroups()).catch((err) => console.error(err));
    }, [dispatch, authz, groupsState.isInvalid]);

    return groupsState;
};

export const useGroupsByID = () => {
    const { itemsByID } = useGroups();
    return itemsByID;
};


// PERMISSIONS LOGIC HOOKS

const useHasPermissionOnAtLeastOneProjectOrDataset = (permissionList) => {
    const {
        permissions: globalPermissions,
        isFetchingPermissions: fetchingEverythingPermissions,
        hasAttemptedPermissions: attemptedEverythingPermissions,
    } = useEverythingPermissions();

    const pdp = useProjectDatasetPermissions();

    const hasPermission = useMemo(
        () => _hasOneOfListedPermissions(permissionList, globalPermissions) || (
            Object.values(pdp).some((ps) => _hasOneOfListedPermissions(permissionList, ps.permissions))
        ),
        [globalPermissions, pdp]);

    const isFetching = useMemo(
        () => fetchingEverythingPermissions || Object.values(pdp).some((ps) => ps.isFetching),
        [fetchingEverythingPermissions, pdp]);

    const hasAttempted = useMemo(
        () => attemptedEverythingPermissions && Object.values(pdp).every((ps) => ps.hasAttempted),
        [attemptedEverythingPermissions, pdp]);

    return { hasPermission, isFetching, hasAttempted };
};

export const useCanQueryAtLeastOneProjectOrDataset = () =>
    useHasPermissionOnAtLeastOneProjectOrDataset(PROJECT_DATASET_QUERY_PERMISSIONS);

export const useCanManageAtLeastOneProjectOrDataset = () =>
    useHasPermissionOnAtLeastOneProjectOrDataset(PROJECT_DATASET_MANAGEMENT_PERMISSIONS);


export const useAuthzManagementPermissions = () => {
    const { data: grants, isFetching: isFetchingGrants } = useGrants();

    // Get existing project/dataset resource permissions
    const projectDatasetPermissions = useProjectDatasetPermissions();

    // Build set of deduplicated grant resources
    const grantResources = useMemo(
        () => [...new Set([
            RESOURCE_EVERYTHING_KEY,
            ...grants.map((g) => makeResourceKey(g.resource))]),
        ].map((rk) => JSON.parse(rk)),  // convert to serialized JSON-format key, deduplicate, and de-serialize
        [grants]);

    const authzService = useService("authorization");
    const grantResourcePermissions = useResourcesPermissions(grantResources, authzService?.url);

    return useMemo(() => {
        const combinedPermissions = Object.fromEntries([
            ...Object.entries(projectDatasetPermissions),
            ...Object.entries(grantResourcePermissions),
        ]);

        const isFetchingPermissions = Object.values(combinedPermissions).some((pd) => pd.isFetching);

        const hasAtLeastOneViewPermissionsGrant =
            Object.values(combinedPermissions).some((pd) => pd.permissions.includes(viewPermissions));
        const hasAtLeastOneEditPermissionsGrant =
            Object.values(combinedPermissions).some((pd) => pd.permissions.includes(editPermissions));

        return {
            isFetching: isFetchingGrants || isFetchingPermissions,
            hasAttempted: Object.values(combinedPermissions).every((pd) => pd.hasAttempted),
            hasAtLeastOneViewPermissionsGrant,
            hasAtLeastOneEditPermissionsGrant,
            grantResourcePermissionsObjects: grantResourcePermissions,
            permissionsObjects: combinedPermissions,
        };
    }, [
        isFetchingGrants,
        projectDatasetPermissions,
        grantResourcePermissions,
    ]);
};


export const useManagerPermissions = () => {
    const { permissions, isFetchingPermissions, hasAttemptedPermissions } = useEverythingPermissions();
    const {
        hasPermission: canManageProjectsDatasets,
        isFetching: isFetchingManageProjectsDatasetsPermissions,
        hasAttempted: hasAttemptedManageProjectsDatasetsPermissions,
    } = useCanManageAtLeastOneProjectOrDataset();

    return useMemo(() => {
        const canViewDropBox = permissions.includes(viewDropBox);
        const canIngest = permissions.includes(ingestData) || permissions.includes(ingestReferenceMaterial);
        const canAnalyzeData = permissions.includes(analyzeData);
        const canExportData = permissions.includes(exportData);
        const canQueryData = permissions.includes(queryData);
        const canViewRuns = permissions.includes(viewRuns);
        const canViewPermissions = permissions.includes(viewPermissions);

        const canManageAnything = (
            canManageProjectsDatasets ||
            canViewDropBox ||
            canIngest ||
            canAnalyzeData ||
            canExportData ||
            canViewRuns ||
            canViewPermissions
        );

        const isFetching = isFetchingPermissions || isFetchingManageProjectsDatasetsPermissions;
        const hasAttempted = hasAttemptedPermissions && hasAttemptedManageProjectsDatasetsPermissions;

        return ({
            permissions: {
                canManageProjectsDatasets,
                canViewDropBox,
                canIngest,
                canAnalyzeData,
                canExportData,
                canQueryData,
                canViewRuns,
                canViewPermissions,
                canManageAnything,
            },
            isFetching,
            hasAttempted,
        });
    }, [
        permissions,
        isFetchingPermissions,
        hasAttemptedPermissions,
        canManageProjectsDatasets,
        isFetchingManageProjectsDatasetsPermissions,
        hasAttemptedManageProjectsDatasetsPermissions,
    ]);
};
