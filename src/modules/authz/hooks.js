import { useMemo } from "react";

import {
    analyzeData,
    createDataset,
    createProject,
    deleteData,
    deleteProject,
    editDataset,
    editProject,
    exportData,
    ingestData,
    ingestReferenceMaterial,
    queryData,
    useResourcesPermissions,
    viewDropBox,
    viewPermissions,
    viewRuns,
} from "bento-auth-js";

import { useEverythingPermissions } from "@/hooks";
import { useProjectsAndDatasetsAsAuthzResources } from "@/modules/metadata/hooks";
import { useService } from "@/modules/services/hooks";

export const useProjectDatasetPermissions = () => {
    const authz = useService("authorization");
    const projectDatasetResources = useProjectsAndDatasetsAsAuthzResources();
    return useResourcesPermissions(projectDatasetResources, authz?.url);
};

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

const useHasPermissionOnAtLeastOneProjectOrDataset = (permissionList) => {
    const {
        permissions: globalPermissions,
        isFetchingPermissions: fetchingEverythingPermissions,
        hasAttemptedPermissions: attemptedEverythingPermissions,
    } = useEverythingPermissions();

    const pdp = useProjectDatasetPermissions();

    const hasPermission = useMemo(
        () => _hasOneOfListedPermissions(permissionList, globalPermissions) || (
            Object.values(pdp).some((ps) => _hasOneOfListedPermissions(ps.permissions))
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
                canQueryData ||
                canViewRuns ||
                canViewPermissions
            ),
        },
        isFetching: isFetchingPermissions || isFetchingManageProjectsDatasetsPermissions,
        hasAttempted: hasAttemptedPermissions && hasAttemptedManageProjectsDatasetsPermissions,
    };
};
