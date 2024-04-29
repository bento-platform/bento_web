import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

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
import { fetchGrants, fetchGroups } from "@/modules/authz/actions";
import { useProjectsAndDatasetsAsAuthzResources } from "@/modules/metadata/hooks";
import { useService } from "@/modules/services/hooks";
import { useAppDispatch, useAppSelector } from "@/store";

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

export const useGrants = () => {
    const dispatch = useAppDispatch();
    const authz = useService("authorization");

    useEffect(() => {
        dispatch(fetchGrants());
    }, [dispatch, authz]);

    return useAppSelector((state) => state.grants);
};

export const useGroups = () => {
    const dispatch = useAppDispatch();
    const authz = useService("authorization");

    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch, authz]);

    return useAppSelector((state) => state.groups);
};

export const useGroupsByID = () => {
    const { data: groups } = useGroups();
    return useMemo(() => Object.fromEntries(groups.map(g => [g.id, g])), [groups]);
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

    const combinedPermissions = useMemo(
        () => Object.fromEntries([
            ...Object.entries(projectDatasetPermissions),
            ...Object.entries(grantResourcePermissions),
        ]),
        [projectDatasetPermissions, grantResourcePermissions]);

    const hasAtLeastOneViewPermissionsGrant = useMemo(
        () => Object.values(combinedPermissions).some((pd) => pd.permissions.includes(viewPermissions)),
        [combinedPermissions]);

    const hasAtLeastOneEditPermissionsGrant = useMemo(
        () => Object.values(combinedPermissions).some((pd) => pd.permissions.includes(editPermissions)),
        [combinedPermissions]);

    const isFetchingPermissions = useMemo(
        () => Object.values(combinedPermissions).some((pd) => pd.isFetching),
        [combinedPermissions]);

    const hasAttemptedPermissions = useMemo(
        () => Object.values(combinedPermissions).every((pd) => pd.hasAttempted),
        [combinedPermissions]);

    return useMemo(() => ({
        isFetching: isFetchingGrants || isFetchingPermissions,
        hasAttempted: hasAttemptedPermissions,
        hasAtLeastOneViewPermissionsGrant,
        hasAtLeastOneEditPermissionsGrant,
        grantResourcePermissionsObjects: grantResourcePermissions,
        permissionsObjects: combinedPermissions,
    }), [
        isFetchingGrants,
        isFetchingPermissions,
        hasAttemptedPermissions,
        hasAtLeastOneViewPermissionsGrant,
        hasAtLeastOneEditPermissionsGrant,
        grantResourcePermissions,
        combinedPermissions,
    ]);
};


export const useManagerPermissions = () => {
    const { permissions, isFetchingPermissions, hasAttemptedPermissions } = useEverythingPermissions();
    const {
        hasPermission: canManageProjectsDatasets,
        isFetching: isFetchingManageProjectsDatasetsPermissions,
        hasAttempted: hasAttemptedManageProjectsDatasetsPermissions,
    } = useCanManageAtLeastOneProjectOrDataset();

    const canViewDropBox = permissions.includes(viewDropBox);
    const canIngest = permissions.includes(ingestData) || permissions.includes(ingestReferenceMaterial);
    const canAnalyzeData = permissions.includes(analyzeData);
    const canExportData = permissions.includes(exportData);
    const canQueryData = permissions.includes(queryData);
    const canViewRuns = permissions.includes(viewRuns);
    const canViewPermissions = permissions.includes(viewPermissions);

    return {
        permissions: {
            canManageProjectsDatasets,
            canViewDropBox,
            canIngest,
            canAnalyzeData,
            canExportData,
            canQueryData,
            canViewRuns,
            canViewPermissions,
            canManageAnything: (
                canManageProjectsDatasets ||
                canViewDropBox ||
                canIngest ||
                canAnalyzeData ||
                canExportData ||
                canViewRuns ||
                canViewPermissions
            ),
        },
        isFetching: isFetchingPermissions || isFetchingManageProjectsDatasetsPermissions,
        hasAttempted: hasAttemptedPermissions && hasAttemptedManageProjectsDatasetsPermissions,
    };
};
