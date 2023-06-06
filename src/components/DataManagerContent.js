import React, {Suspense, lazy, useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Redirect, Route, Switch} from "react-router-dom";

import {Menu, Skeleton} from "antd";

import {SITE_NAME} from "../constants";
import {matchingMenuKeys, renderMenuItem} from "../utils/menu";
import {withBasePath} from "../utils/url";

import SitePageHeader from "./SitePageHeader";
import {RESOURCE_EVERYTHING} from "../lib/auth/resources";
import ManagerDRSContent from "./manager/drs/ManagerDRSContent";
import ManagerAnalysisContent from "./manager/ManagerAnalysisContent";
import {fetchResourcePermissionsIfPossibleAndNeeded} from "../modules/auth/actions";

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
    const dispatch = useDispatch();

    useEffect(() => {
        document.title = `${SITE_NAME}: Admin / Data Manager`;
    }, []);

    const haveAuthorizationService = !!useSelector(state => state.services.itemsByKind.authorization);

    useEffect(() => {
        if (!haveAuthorizationService) return;
        dispatch(fetchResourcePermissionsIfPossibleAndNeeded(RESOURCE_EVERYTHING));
    }, [haveAuthorizationService])

    const menuItems = useMemo(() => [
        {url: withBasePath("admin/data/manager/projects"), style: {marginLeft: "4px"}, text: "Projects and Datasets"},
        // {url: "/data/manager/access", text: "Access Management"},  // TODO: Re-enable for v0.2
        {url: withBasePath("admin/data/manager/files"), text: "Drop Box"},
        {url: withBasePath("admin/data/manager/ingestion"), text: "Ingestion"},
        {url: withBasePath("admin/data/manager/analysis"), text: "Analysis"},
        {url: withBasePath("admin/data/manager/workflows"), text: "Workflows"},
        {url: withBasePath("admin/data/manager/runs"), text: "Workflow Runs"},
        {url: withBasePath("admin/data/manager/drs"), text: "DRS Objects"},
    ], []);

    const selectedKeys = useMemo(() => matchingMenuKeys(menuItems), [menuItems]);

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
                <Route path={withBasePath("admin/data/manager/projects")}
                       component={ManagerProjectDatasetContent} />
                <Route exact path={withBasePath("admin/data/manager/access")} component={ManagerAccessContent} />
                <Route exact path={withBasePath("admin/data/manager/files")} component={ManagerDropBoxContent} />
                <Route exact path={withBasePath("admin/data/manager/ingestion")}
                       component={ManagerIngestionContent} />
                <Route exact path={withBasePath("admin/data/manager/analysis")}
                       component={ManagerAnalysisContent} />
                <Route exact path={withBasePath("admin/data/manager/workflows")}
                       component={ManagerWorkflowsContent} />
                <Route exact path={withBasePath("admin/data/manager/drs")} component={ManagerDRSContent} />
                <Route path={withBasePath("admin/data/manager/runs")} component={ManagerRunsContent} />
                <Redirect from={withBasePath("admin/data/manager")}
                          to={withBasePath("admin/data/manager/projects")} />
            </Switch>
        </Suspense>
    </>;
};

export default DataManagerContent;
