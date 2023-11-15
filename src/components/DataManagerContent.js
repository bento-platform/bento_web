import React, {Suspense, lazy, useEffect, useMemo} from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import {Menu, Skeleton} from "antd";

import {SITE_NAME} from "../constants";
import {matchingMenuKeys, renderMenuItem} from "../utils/menu";

import SitePageHeader from "./SitePageHeader";
import {viewDropBox} from "../lib/auth/permissions";
import {RESOURCE_EVERYTHING} from "../lib/auth/resources";
import ManagerDRSContent from "./manager/drs/ManagerDRSContent";
import ManagerAnalysisContent from "./manager/ManagerAnalysisContent";
import {useHasResourcePermission} from "../lib/auth/utils";
import { useFetchDropBoxContentsIfAllowed } from "./manager/hooks";

const ManagerProjectDatasetContent = lazy(() => import("./manager/projects/ManagerProjectDatasetContent"));
const ManagerAccessContent = lazy(() => import("./manager/ManagerAccessContent"));
const ManagerDropBoxContent = lazy(() => import("./manager/ManagerDropBoxContent"));
const ManagerIngestionContent = lazy(() => import("./manager/ManagerIngestionContent"));
const ManagerWorkflowsContent = lazy(() => import("./manager/ManagerWorkflowsContent"));
const ManagerRunsContent = lazy(() => import("./manager/runs/ManagerRunsContent"));

const styles = {
    menu: {
        marginLeft: "-24px",
        marginRight: "-24px",
        marginTop: "-12px",
    },
    suspenseFallback: {padding: "24px", backgroundColor: "white"},
};

const DataManagerContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME}: Admin / Data Manager`;
    }, []);

    useFetchDropBoxContentsIfAllowed();

    const { hasPermission: hasViewDropBoxPermission } = useHasResourcePermission(RESOURCE_EVERYTHING, viewDropBox);

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
    ], [hasViewDropBoxPermission]);

    const selectedKeys = useMemo(() => matchingMenuKeys(menuItems), [menuItems, window.location.pathname]);

    return <>
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
                <Route path="/admin/data/manager/runs" component={ManagerRunsContent} />
                <Redirect from="/admin/data/manager" to="/admin/data/manager/projects" />
            </Switch>
        </Suspense>
    </>;
};

export default DataManagerContent;
