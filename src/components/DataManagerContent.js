import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { viewDropBox, RESOURCE_EVERYTHING } from "bento-auth-js";

import { Menu, Skeleton } from "antd";

import { SITE_NAME } from "@/constants";
import { useHasResourcePermissionWrapper } from "@/hooks";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import SitePageHeader from "./SitePageHeader";
import { useFetchDropBoxContentsIfAllowed } from "./manager/hooks";

const ManagerProjectDatasetContent = lazy(() => import("./manager/projects/ManagerProjectDatasetContent"));
const ManagerAccessContent = lazy(() => import("./manager/ManagerAccessContent"));
const ManagerDropBoxContent = lazy(() => import("./manager/ManagerDropBoxContent"));
const ManagerIngestionContent = lazy(() => import("./manager/ManagerIngestionContent"));
const ManagerAnalysisContent = lazy(() => import("./manager/ManagerAnalysisContent"));
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

    useFetchDropBoxContentsIfAllowed();

    const { hasPermission: hasViewDropBoxPermission } = useHasResourcePermissionWrapper(
        RESOURCE_EVERYTHING, viewDropBox);

    const menuItems = useMemo(() => [
        {url: "/admin/data/manager/projects", style: {marginLeft: "4px"}, text: "Projects and Datasets"},
        // {url: "/data/manager/access", text: "Access Management"},  // TODO: Re-enable for v0.2
        {
            url: "/admin/data/manager/files",
            text: "Drop Box",
            disabled: !hasViewDropBoxPermission,
        },
        {url: "/admin/data/manager/ingestion", text: "Ingestion"},
        {url: "/admin/data/manager/analysis", text: "Analysis"},
        {url: "/admin/data/manager/workflows", text: "Workflows"},
        {url: "/admin/data/manager/runs", text: "Workflow Runs"},
        {url: "/admin/data/manager/drs", text: "DRS Objects"},
        {url: "/admin/data/manager/genomes", text: "Reference Genomes"},
    ], [hasViewDropBoxPermission]);

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
                <Switch>
                    <Route path="/admin/data/manager/projects"><ManagerProjectDatasetContent /></Route>
                    <Route exact path="/admin/data/manager/access"><ManagerAccessContent /></Route>
                    <Route exact path="/admin/data/manager/files"><ManagerDropBoxContent /></Route>
                    <Route exact path="/admin/data/manager/ingestion"><ManagerIngestionContent /></Route>
                    <Route exact path="/admin/data/manager/analysis"><ManagerAnalysisContent /></Route>
                    <Route exact path="/admin/data/manager/workflows"><ManagerWorkflowsContent /></Route>
                    <Route exact path="/admin/data/manager/drs"><ManagerDRSContent /></Route>
                    <Route exact path="/admin/data/manager/genomes"><ManagerReferenceGenomesContent /></Route>
                    <Route path="/admin/data/manager/runs"><ManagerRunsContent /></Route>
                    <Route path="/admin/data/manager" render={() => <Redirect to="/admin/data/manager/projects" />} />
                </Switch>
            </Suspense>
        </>
    );
};

export default DataManagerContent;
