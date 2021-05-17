import React, {Component, Suspense} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Menu, Skeleton} from "antd";

import SitePageHeader from "../SitePageHeader";
import ServiceOverview from "./ServiceOverview";
import ServiceLogs from "./ServiceLogs";

import {matchingMenuKeys, renderMenuItem} from "../../utils/menu";
import {withBasePath} from "../../utils/url";
import {Redirect, Route, Switch} from "react-router-dom";

const pageMenu = artifact => [
    {url: withBasePath(`admin/services/${artifact}/overview`), style: {marginLeft: "4px"}, text: "Overview"},
    {url: withBasePath(`admin/services/${artifact}/logs`), text: "Logs"},
];

// TODO: Deduplicate with data manager
const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px"
};

class ServiceDetail extends Component {
    render() {
        // TODO: 404
        const artifact = this.props.match.params.artifact;
        const serviceInfo = this.props.serviceInfoByArtifact[artifact] || null;

        const menuItems = pageMenu(artifact);
        const selectedKeys = matchingMenuKeys(menuItems);

        return <>
            <SitePageHeader title={(serviceInfo || {}).name || ""}
                            subTitle={(serviceInfo || {}).description || ""}
                            footer={<Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                                {menuItems.map(renderMenuItem)}
                            </Menu>}
                            withTabBar={true}
                            onBack={() => this.props.history.push(withBasePath("dashboard"))} />
            <Suspense fallback={<div style={{padding: "24px", backgroundColor: "white"}}><Skeleton active /></div>}>
                <Switch>
                    <Route exact path={withBasePath("admin/services/:artifact/overview")}
                           component={ServiceOverview} />
                    <Route path={withBasePath("admin/services/:artifact/logs")} component={ServiceLogs} />
                    <Redirect from={withBasePath(`admin/services/${artifact}`)}
                              to={withBasePath(`admin/services/${artifact}/overview`)} />
                </Switch>
            </Suspense>
        </>;
    }
}

ServiceDetail.propTypes = {
    serviceInfoByArtifact: PropTypes.objectOf(PropTypes.object),  // TODO
};

const mapStateToProps = state => ({
    serviceInfoByArtifact: state.services.itemsByArtifact,
});

export default connect(mapStateToProps)(ServiceDetail);
