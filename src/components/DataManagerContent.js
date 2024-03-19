import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { viewDropBox, viewPermissions, RESOURCE_EVERYTHING, useResourcePermissions } from "bento-auth-js";

import { Menu, Skeleton } from "antd";

import { SITE_NAME } from "@/constants";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import SitePageHeader from "./SitePageHeader";
import { useFetchDropBoxContentsIfAllowed } from "./manager/hooks";

const ManagerProjectDatasetContent = lazy(() => import("./manager/projects/ManagerProjectDatasetContent"));
const ManagerAccessContent = lazy(() => import("./manager/access/ManagerAccessContent"));
const ManagerDropBoxContent = lazy(() => import("./manager/ManagerDropBoxContent"));
const ManagerIngestionContent = lazy(() => import("./manager/ManagerIngestionContent"));
const ManagerAnalysisContent = lazy(() => import("./manager/ManagerAnalysisContent"));
const ManagerExportContent = lazy(() => import("./manager/ManagerExportContent"));
const ManagerWorkflowsContent = lazy(() => import("./manager/ManagerWorkflowsContent"));
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

    const authorizationService = useSelector((state) => state.services.itemsByKind.authorization);

    const { permissions } = useResourcePermissions(RESOURCE_EVERYTHING, authorizationService?.url);
    useFetchDropBoxContentsIfAllowed();

    const canViewDropBox = permissions.includes(viewDropBox);
    const canViewPermissions = permissions.includes(viewPermissions);

    const menuItems = useMemo(() => [
        { url: "/data/manager/projects", style: { marginLeft: "4px" }, text: "Projects and Datasets" },
        { url: "/data/manager/files", text: "Drop Box", disabled: !canViewDropBox },
        { url: "/data/manager/ingestion", text: "Ingestion" },
        { url: "/data/manager/analysis", text: "Analysis" },
        { url: "/data/manager/export", text: "Export" },
        { url: "/data/manager/workflows", text: "Workflows" },
        { url: "/data/manager/runs", text: "Workflow Runs" },
        { url: "/data/manager/drs", text: "DRS Objects" },
        {
            url: "/data/manager/access",
            text: "Access Management",
            // TODO: check if we have any viewPermissions in any grant, not just on RESOURCE_EVERYTHING
            disabled: !canViewPermissions,
        },
        { url: "/data/manager/genomes", text: "Reference Genomes" },
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
                    <Route path="workflows" element={<ManagerWorkflowsContent />} />
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
