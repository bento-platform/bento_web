import React, {Component} from "react";

import {Redirect, Route, Switch} from "react-router-dom";

import {Layout} from "antd";

import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";

import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";


class ManagerRunsContent extends Component {
    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Switch>
                    <Route exact path="/admin/data/manager/runs" component={RunListContent} />
                    <Route path="/admin/data/manager/runs/:id/:tab" component={RunDetailContent} />
                    <Redirect from="/admin/data/manager/runs/:id" to="/admin/data/manager/runs/:id/request" />
                    <Redirect from="/admin/data/manager" to="/admin/data/manager/projects" />
                </Switch>
            </Layout.Content>
        </Layout>;
    }
}

export default ManagerRunsContent;
