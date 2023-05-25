import React, {Component, Suspense} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Menu, Skeleton} from "antd";

import SitePageHeader from "../SitePageHeader";
import ServiceOverview from "./ServiceOverview";

import {matchingMenuKeys, renderMenuItem} from "../../utils/menu";
import {Redirect, Route, Switch} from "react-router-dom";

const pageMenu = artifact => [
    {url: `/admin/services/${artifact}/overview`, style: {marginLeft: "4px"}, text: "Overview"},
];

// TODO: Deduplicate with data manager
const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px",
};

class ServiceDetail extends Component {
    render() {
        // TODO: 404
        const kind = this.props.match.params.artifact;
        const serviceInfo = this.props.serviceInfoByKind[kind] || null;

        const menuItems = pageMenu(kind);
        const selectedKeys = matchingMenuKeys(menuItems);

        return <>
            <SitePageHeader title={(serviceInfo || {}).name || ""}
                            subTitle={(serviceInfo || {}).description || ""}
                            footer={<Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                                {menuItems.map(renderMenuItem)}
                            </Menu>}
                            withTabBar={true}
                            onBack={() => this.props.history.push("/admin/services")} />
            <Suspense fallback={<div style={{padding: "24px", backgroundColor: "white"}}><Skeleton active /></div>}>
                <Switch>
                    <Route exact path="/admin/services/:kind/overview"
                           component={ServiceOverview} />
                    <Redirect from={`/admin/services/${kind}`}
                              to={`/admin/services/${kind}/overview`} />
                </Switch>
            </Suspense>
        </>;
    }
}

ServiceDetail.propTypes = {
    serviceInfoByKind: PropTypes.objectOf(PropTypes.object),  // TODO
};

const mapStateToProps = state => ({
    serviceInfoByKind: state.services.itemsByKind,
});

export default connect(mapStateToProps)(ServiceDetail);
