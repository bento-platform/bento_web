import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Badge, Icon, Layout, Menu, Modal } from "antd";

import { showNotificationDrawer } from "../modules/notifications/actions";
import { SIGN_OUT_URL } from "../constants";
import { matchingMenuKeys, renderMenuItem } from "../utils/menu";
import { BASE_PATH, signInURLWithRedirect, withBasePath } from "../utils/url";
import { nodeInfoDataPropTypesShape, notificationPropTypesShape, userPropTypesShape } from "../propTypes";
import logo from "../images/logo.png";
import OverviewSettingsControl from "./overview/OverviewSettingsControl";
import { DEFAULT_OTHER_THRESHOLD_PERCENTAGE } from "../constants";

const customHeader = process.env.CUSTOM_HEADER ?? "";

class SiteHeader extends Component {
    constructor() {
        super();
        const startThreshold =
      JSON.parse(localStorage.getItem("otherThresholdPercentage")) ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE;
        this.state = {
            current: "mail",
            otherThresholdPercentage: startThreshold,
            previousThresholdPercentage: startThreshold,
            modalVisible: false,
        };
        this.setOtherThresholdPercentage = this.setOtherThresholdPercentage.bind(this);
        this.openModal = this.openModal.bind(this);
        this.setValueAndCloseModal = this.setValueAndCloseModal.bind(this);
        this.cancelModal = this.cancelModal.bind(this);
    }

    setOtherThresholdPercentage(value) {
        this.setState({ otherThresholdPercentage: value });
    }

    openModal() {
        this.setState({ modalVisible: true });
    // save threshold in case user cancels
        this.setState({ previousThresholdPercentage: this.state.otherThresholdPercentage });
    }

    setValueAndCloseModal() {
        localStorage.setItem("otherThresholdPercentage", JSON.stringify(this.state.otherThresholdPercentage));
        this.setState({ modalVisible: false });
    }

    cancelModal() {
        this.setState({ modalVisible: false });
        this.setState({ otherThresholdPercentage: this.state.previousThresholdPercentage });
    }

    render() {
        const menuItems = [
            {
                url: withBasePath("overview"),
                icon: <Icon type="user" />,
                text: <span className="nav-text">Overview</span>,
                key: "overview",
            },
            {
                url: withBasePath("data/sets"),
                icon: <Icon type="file-search" />,
                text: <span className="nav-text">Datasets</span>,
                key: "datasets",
            },
            {
                url: withBasePath("data/explorer"),
                icon: <Icon type="bar-chart" />,
                text: <span className="nav-text">Explorer</span>,
                disabled: !this.props.isOwner,
                key: "explorer",
            },
            {
                url: withBasePath("admin"),
                icon: <Icon type="user" />,
                text: <span className="nav-text">Admin</span>,
                disabled: !this.props.isOwner,
                children: [
                    {
                        key: "admin-services",
                        url: withBasePath("admin/services"),
                        icon: <Icon type="dashboard" />,
                        text: <span className="nav-text">Services</span>,
                        disabled: !this.props.isOwner,
                    },
                    {
                        key: "admin-data-manager",
                        url: withBasePath("admin/data/manager"),
                        icon: <Icon type="folder-open" />,
                        text: <span className="nav-text">Data Manager</span>,
                        disabled: !this.props.isOwner,
                    },
                    {
                        key: "admin-peers",
                        url: withBasePath("admin/peers"),
                        icon: <Icon type="apartment" />,
                        text: <span className="nav-text">Peers</span>,
                        disabled: !this.props.isOwner,
                    },
                ],
            },
            ...(this.props.user
                ? [
                    {
                        key: "user-menu",
                        style: { float: "right" },
                        icon: <Icon type="user" />,
                        text: this.props.user.preferred_username,
                        children: [
                            {
                                key: "sign-out-link",
                                onClick: () => (window.location.href = withBasePath(SIGN_OUT_URL)),
                                icon: <Icon type="logout" />,
                                text: <span className="nav-text">Sign Out</span>,
                            },
                        ],
                    },
                ]
                : [
                    {
                        key: "sign-in",
                        style: { float: "right" },
                        icon: <Icon type="login" />,
                        text: (
                <span className="nav-text">{this.props.authHasAttempted ? "Sign In" : "Loading..."}</span>
                        ),
                        onClick: () => (window.location.href = signInURLWithRedirect()),
                    },
                ]),
            {
                url: withBasePath("notifications"),
                style: { float: "right" },
                disabled: !this.props.isOwner,
                icon: (
          <Badge dot count={this.props.unreadNotifications.length}>
            <Icon type="bell" style={{ marginRight: "0" }} />
          </Badge>
                ),
                text: (
          <span className="nav-text" style={{ marginLeft: "10px" }}>
            Notifications
            {this.props.unreadNotifications.length > 0 ? (
              <span> ({this.props.unreadNotifications.length})</span>
            ) : null}
          </span>
                ),
                onClick: () => this.props.showNotificationDrawer(),
                key: "notifications",
            },
            {
                style: { float: "right" },
                icon: <Icon type="setting" />,
                text: <span className="nav-text">Settings</span>,
                onClick: this.openModal,
                key: "settings",
            },
        ];

        return (
            <>
        <Layout.Header>
          <Link to={BASE_PATH}>
            <div
              style={{
                  margin: "0 15px 0 0",
                  float: "left",
              }}
            >
              <img style={{ height: "35px" }} src={logo} alt="logo" />
            </div>
          </Link>
          {customHeader && (
            <h3 style={{ color: "rgba(255, 255, 255, 0.95)", float: "left", margin: "0 10px 0 -10px" }}>
              {customHeader}
            </h3>
          )}
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={matchingMenuKeys(menuItems)}
            style={{ lineHeight: "64px" }}
          >
            {menuItems.map((i) => renderMenuItem(i))}
          </Menu>
        </Layout.Header>
        <Modal
          visible={this.state.modalVisible}
          closable={false}
          destroyOnClose={true}
          onOk={this.setValueAndCloseModal}
          onCancel={this.cancelModal}
        >
          <OverviewSettingsControl
            otherThresholdPercentage={this.state.otherThresholdPercentage}
            setOtherThresholdPercentage={this.setOtherThresholdPercentage}
            setValueAndCloseModal={this.setValueAndCloseModal}
          />
        </Modal>
            </>
        );
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

const mapStateToProps = (state) => ({
    nodeInfo: state.nodeInfo.data,
    unreadNotifications: state.notifications.items.filter((n) => !n.read),
    user: state.auth.user,
    authHasAttempted: state.auth.hasAttempted,
    isOwner: (state.auth.user || {}).chord_user_role === "owner",
});

export default withRouter(connect(mapStateToProps, { showNotificationDrawer })(SiteHeader));
