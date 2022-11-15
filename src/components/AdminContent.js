import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Redirect, Switch} from "react-router-dom";
import {BASE_PATH, withBasePath} from "../utils/url";

import {Layout} from "antd";

import OwnerRoute from "./OwnerRoute";
import SitePageHeader from "./SitePageHeader";
import ServiceContent from "./ServiceContent";
import DataManagerContent from "./DataManagerContent";
import ServiceDetail from "./services/ServiceDetail";

import {SITE_NAME} from "../constants";
import {nodeInfoDataPropTypesShape, projectPropTypesShape} from "../propTypes";


class AdminContent extends Component {
    componentDidMount() {
        document.title = `${SITE_NAME} - Admin`;
    }

    render() {
        return <>
            <SitePageHeader title="Admin" subTitle="Administrative tools" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                    {/* <Typography.Title level={3}>Admin</Typography.Title> */}
                    <Switch>
                        <OwnerRoute path={withBasePath("admin/services")} component={ServiceContent} />
                        <OwnerRoute path={withBasePath("admin/services/:artifact")} component={ServiceDetail} />
                        <OwnerRoute path={withBasePath("admin/data/manager")} component={DataManagerContent} />
                        <Redirect from={BASE_PATH} to={withBasePath("admin/services")} />
                    </Switch>
                </Layout.Content>
            </Layout>
        </>;
    }
}

AdminContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    isFetchingNodeInfo: PropTypes.bool,

    projects: PropTypes.arrayOf(projectPropTypesShape),
    isFetchingProjects: PropTypes.bool,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    isFetchingNodeInfo: state.nodeInfo.isFetching,

    projects: state.projects.items,
    isFetchingProjects: state.auth.isFetchingDependentData || state.projects.isFetching,
});

export default connect(mapStateToProps)(AdminContent);
