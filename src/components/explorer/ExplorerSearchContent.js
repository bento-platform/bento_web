import React, {Component} from "react";
import {connect} from "react-redux";
import {Redirect, Route, Switch} from "react-router-dom";
import PropTypes from "prop-types";

import {Layout, Menu, Skeleton} from "antd";

import SitePageHeader from "../SitePageHeader";
import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import ExplorerDatasetSearch from "./ExplorerDatasetSearch";
import {matchingMenuKeys, renderMenuItem} from "../../utils/menu";
import {projectPropTypesShape} from "../../propTypes";

class ExplorerSearchContent extends Component {
    render() {
        const menuItems = this.props.projects.map(project => ({
            // url: `/data/explorer/projects/${project.identifier}`,
            key: project.identifier,
            text: project.title,
            children: project.datasets.map(dataset => ({
                url: `/data/explorer/search/${dataset.identifier}`,
                text: dataset.title,
            })),
        }));

        const datasets = this.props.projects.flatMap(p => p.datasets);

        return <>
            <SitePageHeader title="Data Explorer" />
            <Layout>
                <Layout.Sider style={{background: "white"}} width={256} breakpoint="lg" collapsedWidth={0}>
                    <div style={{display: "flex", height: "100%", flexDirection: "column"}}>
                    <Menu mode="inline"
                          style={{flex: 1, paddingTop: "8px"}}
                          defaultOpenKeys={menuItems.map(p => p.key)}
                          selectedKeys={matchingMenuKeys(menuItems)}>
                        {menuItems.map(renderMenuItem)}
                    </Menu>
                    </div>
                </Layout.Sider>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    {datasets.length > 0 ? (
                        <Switch>
                            <Route path="/data/explorer/search/:dataset" component={ExplorerDatasetSearch} />
                            <Redirect
                                from="/data/explorer/search"
                                to={`/data/explorer/search/${datasets[0].identifier}`} />
                        </Switch>
                    ) : (this.props.isFetchingDependentData ? <Skeleton /> : "No datasets available")}
                </Layout.Content>
            </Layout>
        </>;
    }
}

ExplorerSearchContent.propTypes = {
    projects: PropTypes.arrayOf(projectPropTypesShape),
    isFetchingDependentData: PropTypes.bool,
};

const mapStateToProps = state => ({
    projects: state.projects.items,
    isFetchingDependentData: state.auth.isFetchingDependentData,
    autoQuery: state.explorer.autoQuery,
});

export default connect(mapStateToProps)(ExplorerSearchContent);
