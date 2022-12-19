import React, {Suspense, lazy, useEffect} from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import {Menu, Skeleton} from "antd";

import {SITE_NAME} from "../constants";
import {matchingMenuKeys, renderMenuItem} from "../utils/menu";
import {withBasePath} from "../utils/url";

import SitePageHeader from "./SitePageHeader";

const ManagerProjectDatasetContent = lazy(() => import("./manager/projects/ManagerProjectDatasetContent"));
const ManagerAccessContent = lazy(() => import("./manager/ManagerAccessContent"));
const ManagerFilesContent = lazy(() => import("./manager/ManagerFilesContent"));
const ManagerIngestionContent = lazy(() => import("./manager/ManagerIngestionContent"));
const ManagerWorkflowsContent = lazy(() => import("./manager/ManagerWorkflowsContent"));
const ManagerRunsContent = lazy(() => import("./manager/runs/ManagerRunsContent"));


const PAGE_MENU = [
    {url: withBasePath("admin/data/manager/projects"), style: {marginLeft: "4px"}, text: "Projects and Datasets"},
    // {url: "/data/manager/access", text: "Access Management"},  // TODO: Re-enable for v0.2
    {url: withBasePath("admin/data/manager/files"), text: "Files"},
    {url: withBasePath("admin/data/manager/ingestion"), text: "Ingestion"},
    {url: withBasePath("admin/data/manager/workflows"), text: "Workflows"},
    {url: withBasePath("admin/data/manager/runs"), text: "Workflow Runs"},
];

const styles = {
    menu: {
        marginLeft: "-24px",
        marginRight: "-24px",
        marginTop: "-12px"
    },
    suspenseFallback: {padding: "24px", backgroundColor: "white"},
};

const DataManagerContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME}: Admin / Data Manager`;
    });

    const selectedKeys = matchingMenuKeys(PAGE_MENU);
    return <>
        <SitePageHeader
            title="Admin › Data Manager"
            withTabBar={true}
            footer={
                <Menu mode="horizontal" style={styles.menu} selectedKeys={selectedKeys}>
                    {PAGE_MENU.map(renderMenuItem)}
                </Menu>
            }
        />
        <Suspense fallback={<div style={styles.suspenseFallback}><Skeleton active /></div>}>
            <Switch>
                <Route path={withBasePath("admin/data/manager/projects")}
                       component={ManagerProjectDatasetContent} />
                <Route exact path={withBasePath("admin/data/manager/access")} component={ManagerAccessContent} />
                <Route exact path={withBasePath("admin/data/manager/files")} component={ManagerFilesContent} />
                <Route exact path={withBasePath("admin/data/manager/ingestion")}
                       component={ManagerIngestionContent} />
                <Route exact path={withBasePath("admin/data/manager/workflows")}
                       component={ManagerWorkflowsContent} />
                <Route path={withBasePath("admin/data/manager/runs")} component={ManagerRunsContent} />
                <Redirect from={withBasePath("admin/data/manager")}
                          to={withBasePath("admin/data/manager/projects")} />
            </Switch>
        </Suspense>
    </>;
};

export default DataManagerContent;
