import React, {Component} from "react";

import {Redirect, Route, Switch} from "react-router-dom";

import {Layout} from "antd";

import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";

import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";
import {withBasePath} from "../../../utils/url";


class ManagerRunsContent extends Component {
    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Switch>
                    <Route exact path={withBasePath("admin/data/manager/runs")} component={RunListContent} />
                    <Route path={withBasePath("admin/data/manager/runs/:id/:tab")} component={RunDetailContent} />
                    <Redirect from={withBasePath("admin/data/manager/runs/:id")}
                              to={withBasePath("admin/data/manager/runs/:id/request")} />
                    <Redirect from={withBasePath("admin/data/manager")}
                              to={withBasePath("admin/data/manager/projects")} />
                </Switch>
            </Layout.Content>
        </Layout>;
    }
}

export default ManagerRunsContent;
