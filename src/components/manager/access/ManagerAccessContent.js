import React from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";

import { Layout } from "antd";

import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import AccessTabs from "./AccessTabs";

const ManagerAccessContent = () => {
    const { path } = useRouteMatch();
    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Switch>
                    <Route path={`${path}/grants`}><AccessTabs /></Route>
                    <Route path={`${path}/groups`}><AccessTabs /></Route>
                    <Route path={path} render={() => <Redirect to={`${path}/grants`} />} />
                </Switch>
            </Layout.Content>
        </Layout>
    );
};

export default ManagerAccessContent;
