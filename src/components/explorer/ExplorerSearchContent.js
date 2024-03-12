import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";

import { Layout, Menu, Skeleton } from "antd";

import ExplorerDatasetSearch from "./ExplorerDatasetSearch";
import SitePageHeader from "../SitePageHeader";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

const ExplorerSearchContent = () => {
    const projects = useSelector((state) => state.projects.items);
    const isFetchingDependentData = useSelector((state) => state.user.isFetchingDependentData);

    const menuItems = useMemo(() => projects.map(project => ({
        // url: `/data/explorer/projects/${project.identifier}`,
        key: project.identifier,
        text: project.title,
        children: project.datasets.map((dataset) => ({
            url: `/data/explorer/search/${dataset.identifier}`,
            text: dataset.title,
        })),
    })), [projects]);

    const datasets = useMemo(() => projects.flatMap(p => p.datasets), [projects]);

    return <>
        <SitePageHeader title="Data Explorer" />
        <Layout>
            <Layout.Sider style={{background: "white"}} width={256} breakpoint="lg" collapsedWidth={0}>
                <div style={{display: "flex", height: "100%", flexDirection: "column"}}>
                    <Menu
                        mode="inline"
                        style={{flex: 1, paddingTop: "8px"}}
                        defaultOpenKeys={menuItems.map(p => p.key)}
                        selectedKeys={matchingMenuKeys(menuItems)}
                        items={menuItems.map(transformMenuItem)}
                    />
                </div>
            </Layout.Sider>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                {datasets.length > 0 ? (
                    <Switch>
                        <Route path="/data/explorer/search/:dataset"><ExplorerDatasetSearch /></Route>
                        <Route path="/data/explorer/search"
                               render={() => <Redirect to={`/data/explorer/search/${datasets[0].identifier}`}/>} />
                    </Switch>
                ) : (isFetchingDependentData ? <Skeleton /> : "No datasets available")}
            </Layout.Content>
        </Layout>
    </>;
};

export default ExplorerSearchContent;
