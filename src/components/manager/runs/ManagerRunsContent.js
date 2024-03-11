import React from "react";
import { Route, Switch } from "react-router-dom";
import { Layout } from "antd";

import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";


const ManagerRunsContent = () => (
    <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Switch>
                <Route exact path="/admin/data/manager/runs"><RunListContent /></Route>
                <Route path="/admin/data/manager/runs/:id"><RunDetailContent /></Route>
            </Switch>
        </Layout.Content>
    </Layout>
);

export default ManagerRunsContent;
