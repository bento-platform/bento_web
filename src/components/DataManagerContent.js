import React, { useEffect, Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import { Menu, Skeleton } from "antd";

import { SITE_NAME } from "../constants";
import { matchingMenuKeys, renderMenuItem } from "../utils/menu";
import { withBasePath } from "../utils/url";

import SitePageHeader from "./SitePageHeader";

const ManagerProjectDatasetContent = lazy(() =>
    import("./manager/projects/ManagerProjectDatasetContent")
);
const ManagerAccessContent = lazy(() =>
    import("./manager/ManagerAccessContent")
);
const ManagerFilesContent = lazy(() => import("./manager/ManagerFilesContent"));
const ManagerIngestionContent = lazy(() =>
    import("./manager/ManagerIngestionContent")
);
const ManagerWorkflowsContent = lazy(() =>
    import("./manager/ManagerWorkflowsContent")
);
const ManagerRunsContent = lazy(() =>
    import("./manager/runs/ManagerRunsContent")
);

const PAGE_MENU = [
    {
        url: withBasePath("admin/data/manager/projects"),
        style: { marginLeft: "4px" },
        text: "Projects and Datasets",
    },
    // {url: "/data/manager/access", text: "Access Management"},  // TODO: Re-enable for v0.2
    { url: withBasePath("admin/data/manager/files"), text: "Files" },
    { url: withBasePath("admin/data/manager/ingestion"), text: "Ingestion" },
    { url: withBasePath("admin/data/manager/workflows"), text: "Workflows" },
    { url: withBasePath("admin/data/manager/runs"), text: "Workflow Runs" },
];

const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px",
};

const DataManagerContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Manage Your Data`;
    }, []);

    const selectedKeys = matchingMenuKeys(PAGE_MENU);
    return (
        <>
            <SitePageHeader
                title="Data Manager"
                withTabBar={true}
                footer={
                    <Menu
                        mode="horizontal"
                        style={MENU_STYLE}
                        selectedKeys={selectedKeys}
                    >
                        {PAGE_MENU.map(renderMenuItem)}
                    </Menu>
                }
            />
            <Suspense
                fallback={
                    <div
                        style={{
                            padding: "24px",
                            backgroundColor: "white",
                        }}
                    >
                        <Skeleton active />
                    </div>
                }
            >
                <Switch>
                    <Route
                        path={withBasePath("admin/data/manager/projects")}
                        component={ManagerProjectDatasetContent}
                    />
                    <Route
                        exact
                        path={withBasePath("admin/data/manager/access")}
                        component={ManagerAccessContent}
                    />
                    <Route
                        exact
                        path={withBasePath("admin/data/manager/files")}
                        component={ManagerFilesContent}
                    />
                    <Route
                        exact
                        path={withBasePath("admin/data/manager/ingestion")}
                        component={ManagerIngestionContent}
                    />
                    <Route
                        exact
                        path={withBasePath("admin/data/manager/workflows")}
                        component={ManagerWorkflowsContent}
                    />
                    <Route
                        path={withBasePath("admin/data/manager/runs")}
                        component={ManagerRunsContent}
                    />
                    <Redirect
                        from={withBasePath("admin/data/manager")}
                        to={withBasePath("admin/data/manager/projects")}
                    />
                </Switch>
            </Suspense>
        </>
    );
};

export default DataManagerContent;
