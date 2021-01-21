import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Badge, Icon, Layout, Menu} from "antd";

import "antd/es/badge/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

import {showNotificationDrawer} from "../modules/notifications/actions";

import {SIGN_OUT_URL, SITE_NAME} from "../constants";
import {matchingMenuKeys, renderMenuItem} from "../utils/menu";
import {BASE_PATH, signInURLWithRedirect, withBasePath} from "../utils/url";
import {nodeInfoDataPropTypesShape, notificationPropTypesShape, userPropTypesShape} from "../propTypes";


class SiteHeader extends Component {
    constructor(){
        super();
        this.state = {
            current: "mail",
        };
    }
    handleSubMenuClick(e) {
        console.log("click ", e);
        this.setState({
            current: e.key,
        });
    }

    render() {
        const menuItems = [
            {
                url: withBasePath("overview"),
                icon: <Icon type="user" />,
                text: <span className="nav-text">Overview</span>,
            },
            {
                url: withBasePath("data/sets"),
                icon: <Icon type="file-search" />,
                text: <span className="nav-text">Datasets</span>,
            },
            {
                url: withBasePath("data/explorer"),
                icon: <Icon type="bar-chart" />,
                text: <span className="nav-text">Explorer</span>,
                disabled: !this.props.isOwner,
            },
            {
                url: withBasePath("admin"),
                icon: <Icon type="user" />,
                text:  <span className="nav-text">Admin</span>,
                disabled: !this.props.isOwner,
                children: [{
                    key: "admin-services",
                    url: withBasePath("admin/services"),
                    icon: <Icon type="dashboard" />,
                    text: <span className="nav-text">Services</span>,
                    disabled: !this.props.isOwner,
                },{
                    key: "admin-data-manager",
                    url: withBasePath("admin/data/manager"),
                    icon: <Icon type="folder-open" />,
                    text: <span className="nav-text">Data Manager</span>,
                    disabled: !this.props.isOwner,
                },{
                    key: "admin-peers",
                    url: withBasePath("admin/peers"),
                    icon: <Icon type="apartment" />,
                    text: <span className="nav-text">Peers</span>,
                    disabled: !this.props.isOwner,
                },]
            },
            ...(this.props.user ? [{
                key: "user-menu",
                style: {float: "right"},
                icon: <Icon type="user" />,
                text: this.props.user.preferred_username,
                children: [{
                    key: "sign-out-link",
                    onClick: () => window.location.href = withBasePath(SIGN_OUT_URL),
                    icon: <Icon type="logout" />,
                    text: <span className="nav-text">Sign Out</span>,
                }]
            }] : [{
                key: "sign-in",
                style: {float: "right"},
                icon: <Icon type="login" />,
                text: <span className="nav-text">{this.props.authHasAttempted ? "Sign In" : "Loading..."}</span>,
                onClick: () => window.location.href = signInURLWithRedirect(),
            }]),
            {
                url: withBasePath("notifications"),
                style: {float: "right"},
                disabled: !this.props.isOwner,
                icon: <Badge dot count={this.props.unreadNotifications.length}>
                    <Icon type="bell" style={{marginRight: "0"}}/>
                </Badge>,
                text: <span className="nav-text" style={{marginLeft: "10px"}}>
                    Notifications
                    {this.props.unreadNotifications.length > 0 ? (
                        <span> ({this.props.unreadNotifications.length})</span>
                    ) : null}
                </span>,
                onClick: () => this.props.showNotificationDrawer(),
            }
        ];

        return <Layout.Header>
            <Link to={BASE_PATH}><h1 style={{
                display: "inlineBlock",
                color: "rgba(255, 255, 255, 0.95)",
                margin: "0 30px 0 0",
                float: "left"
            }}>{SITE_NAME}</h1></Link>
            <Menu theme="dark"
                  mode="horizontal"
                  selectedKeys={matchingMenuKeys(menuItems)}
                  style={{lineHeight: "64px"}}>

                {menuItems.map(i => renderMenuItem(i))}

            </Menu>
        </Layout.Header>;
    }
}


SiteHeader.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    unreadNotifications: PropTypes.arrayOf(notificationPropTypesShape),
    user: userPropTypesShape,
    authHasAttempted: PropTypes.bool,
    isOwner: PropTypes.bool,

    showNotificationDrawer: PropTypes.func,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    unreadNotifications: state.notifications.items.filter(n => !n.read),
    user: state.auth.user,
    authHasAttempted: state.auth.hasAttempted,
    isOwner: (state.auth.user || {}).chord_user_role === "owner"
});

export default withRouter(connect(mapStateToProps, {showNotificationDrawer})(SiteHeader));
