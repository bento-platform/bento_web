import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
    viewDropBox,
    viewPermissions,
    RESOURCE_EVERYTHING,
    queryData,
    viewRuns,
    ingestData,
    analyzeData,
    exportData,
    ingestReferenceMaterial,
} from "bento-auth-js";

import { Menu, Skeleton } from "antd";

import { SITE_NAME } from "@/constants";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import SitePageHeader from "./SitePageHeader";
import { useFetchDropBoxContentsIfAllowed } from "./manager/hooks";
import { useResourcePermissionsWrapper } from "@/hooks";

const ManagerProjectDatasetContent = lazy(() => import("./manager/projects/ManagerProjectDatasetContent"));
const ManagerAccessContent = lazy(() => import("./manager/access/ManagerAccessContent"));
const ManagerDropBoxContent = lazy(() => import("./manager/ManagerDropBoxContent"));
const ManagerIngestionContent = lazy(() => import("./manager/ManagerIngestionContent"));
const ManagerAnalysisContent = lazy(() => import("./manager/ManagerAnalysisContent"));
const ManagerExportContent = lazy(() => import("./manager/ManagerExportContent"));
const ManagerRunsContent = lazy(() => import("./manager/runs/ManagerRunsContent"));
const ManagerDRSContent = lazy(() => import("./manager/drs/ManagerDRSContent"));
const ManagerReferenceGenomesContent = lazy(() => import("./manager/reference/ManagerReferenceGenomesContent"));

const styles = {
    menu: {
        marginLeft: "-24px",
        marginRight: "-24px",
        marginTop: "-12px",
    },
    suspenseFallback: { padding: "24px", backgroundColor: "white" },
};

const DataManagerContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME}: Admin / Data Manager`;
    }, []);

    const { permissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);
    useFetchDropBoxContentsIfAllowed();

    const canViewDropBox = permissions.includes(viewDropBox);
    const canIngest = permissions.includes(ingestData) || permissions.includes(ingestReferenceMaterial);
    const canAnalyzeData = permissions.includes(analyzeData);
    const canExportData = permissions.includes(exportData);
    const canQueryData = permissions.includes(queryData);
    const canViewRuns = permissions.includes(viewRuns);
    const canViewPermissions = permissions.includes(viewPermissions);

    const menuItems = useMemo(() => [
        { url: "/data/manager/projects", style: { marginLeft: "4px" }, text: "Projects and Datasets" },
        { url: "/data/manager/files", text: "Drop Box", disabled: !canViewDropBox },
        {
            url: "/data/manager/ingestion",
            text: "Ingestion",
            // TODO: more advanced permissions for this (workflow-level checks)
            disabled: !canIngest,
        },
        {
            url: "/data/manager/analysis",
            text: "Analysis",
            // TODO: more advanced permissions for this (workflow-level checks)
            disabled: !canAnalyzeData,
        },
        {
            url: "/data/manager/export",
            text: "Export",
            // TODO: more advanced permissions for this (workflow-level checks)
            disabled: !canExportData,
        },
        {
            url: "/data/manager/runs",
            text: "Workflow Runs",
            // TODO: check if we have any viewRuns in any grant, not just on RESOURCE_EVERYTHING
            disabled: !canViewRuns,
        },
        {
            url: "/data/manager/drs",
            text: "DRS Objects",
            // TODO: allow always, when we have object-level permissions on the front end for DRS.
            disabled: !canQueryData,
        },
        {
            url: "/data/manager/access",
            text: "Access Management",
            // TODO: check if we have any viewPermissions in any grant, not just on RESOURCE_EVERYTHING
            disabled: !canViewPermissions,
        },
        { url: "/data/manager/genomes", text: "Reference Genomes" },  // always at least viewable
    ], [canViewDropBox, canViewPermissions]);

    const selectedKeys = useMemo(() => matchingMenuKeys(menuItems), [menuItems, window.location.pathname]);

    return (
        <>
            <SitePageHeader
                title="Admin › Data Manager"
                withTabBar={true}
                footer={
                    <Menu
                        mode="horizontal"
                        style={styles.menu}
                        selectedKeys={selectedKeys}
                        items={menuItems.map(transformMenuItem)}
                    />
                }
            />
            <Suspense fallback={<div style={styles.suspenseFallback}><Skeleton active /></div>}>
                <Routes>
                    <Route path="projects/*" element={<ManagerProjectDatasetContent />} />
                    <Route path="access/*" element={<ManagerAccessContent />} />
                    <Route path="files" element={<ManagerDropBoxContent />} />
                    <Route path="ingestion" element={<ManagerIngestionContent />} />
                    <Route path="analysis" element={<ManagerAnalysisContent />} />
                    <Route path="export" element={<ManagerExportContent />} />
                    <Route path="drs" element={<ManagerDRSContent />} />
                    <Route path="genomes" element={<ManagerReferenceGenomesContent />} />
                    <Route path="runs/*" element={<ManagerRunsContent />} />
                    <Route path="*" element={<Navigate to="projects" replace={true} />} />
                </Routes>
            </Suspense>
        </>
    );
};

export default DataManagerContent;
