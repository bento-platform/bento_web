import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { viewDropBox, viewPermissions, RESOURCE_EVERYTHING, useResourcePermissions } from "bento-auth-js";

import { Menu, Skeleton } from "antd";

import { SITE_NAME } from "../constants";
import { useFetchDropBoxContentsIfAllowed } from "./manager/hooks";
import { matchingMenuKeys, renderMenuItem } from "../utils/menu";

import SitePageHeader from "./SitePageHeader";
import { useSelector } from "react-redux";

const ManagerProjectDatasetContent = lazy(() => import("./manager/projects/ManagerProjectDatasetContent"));
const ManagerAccessContent = lazy(() => import("./manager/access/ManagerAccessContent"));
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

    const authorizationService = useSelector(state => state.services.itemsByKind.authorization);

    const { permissions } = useResourcePermissions(RESOURCE_EVERYTHING, authorizationService?.url);
    useFetchDropBoxContentsIfAllowed();

    const canViewDropBox = permissions.includes(viewDropBox);
    const canViewPermissions = permissions.includes(viewPermissions);

    const menuItems = useMemo(() => [
        {url: "/admin/data/manager/projects", style: {marginLeft: "4px"}, text: "Projects and Datasets"},
        {
            url: "/admin/data/manager/files",
            text: "Drop Box",
            disabled: !canViewDropBox,
        },
        {url: "/admin/data/manager/ingestion", text: "Ingestion"},
        {url: "/admin/data/manager/analysis", text: "Analysis"},
        {url: "/admin/data/manager/workflows", text: "Workflows"},
        {url: "/admin/data/manager/runs", text: "Workflow Runs"},
        {url: "/admin/data/manager/drs", text: "DRS Objects"},
        {
            url: "/admin/data/manager/access",
            text: "Access Management",
            // TODO: check if we have any viewPermissions in any grant, not just on RESOURCE_EVERYTHING
            disabled: !canViewPermissions,
        },
        {url: "/admin/data/manager/genomes", text: "Reference Genomes"},
    ], [canViewDropBox, canViewPermissions]);

    const selectedKeys = useMemo(() => matchingMenuKeys(menuItems), [menuItems, window.location.pathname]);

    return (
        <>
            <SitePageHeader
                title="Admin › Data Manager"
                withTabBar={true}
                footer={
                    <Menu mode="horizontal" style={styles.menu} selectedKeys={selectedKeys}>
                        {menuItems.map(renderMenuItem)}
                    </Menu>
                }
            />
            <Suspense fallback={<div style={styles.suspenseFallback}><Skeleton active /></div>}>
                <Switch>
                    <Route path="/admin/data/manager/projects" component={ManagerProjectDatasetContent} />
                    <Route exact path="/admin/data/manager/access" component={ManagerAccessContent} />
                    <Route exact path="/admin/data/manager/files" component={ManagerDropBoxContent} />
                    <Route exact path="/admin/data/manager/ingestion" component={ManagerIngestionContent} />
                    <Route exact path="/admin/data/manager/analysis" component={ManagerAnalysisContent} />
                    <Route exact path="/admin/data/manager/workflows" component={ManagerWorkflowsContent} />
                    <Route exact path="/admin/data/manager/drs" component={ManagerDRSContent} />
                    <Route exact path="/admin/data/manager/genomes" component={ManagerReferenceGenomesContent} />
                    <Route path="/admin/data/manager/runs" component={ManagerRunsContent} />
                    <Redirect from="/admin/data/manager" to="/admin/data/manager/projects" />
                </Switch>
            </Suspense>
        </>
    );
};

export default DataManagerContent;
