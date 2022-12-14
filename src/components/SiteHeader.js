import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Badge, Icon, Layout, Menu } from "antd";

import { CUSTOM_HEADER } from "../config";
import { SIGN_OUT_URL } from "../constants";
import { showNotificationDrawer } from "../modules/notifications/actions";
import { matchingMenuKeys, renderMenuItem } from "../utils/menu";
import { BASE_PATH, signInURLWithRedirect, withBasePath } from "../utils/url";

import OverviewSettingsControl from "./overview/OverviewSettingsControl";

const SiteHeader = () => {
    const dispatch = useDispatch();

    const unreadNotifications = useSelector((state) => state.notifications.items.filter(n => !n.read));
    const { user, hasAttempted: authHasAttempted } = useSelector((state) => state.auth);
    const isOwner = user?.chord_user_role === "owner";

    const [modalVisible, setModalVisible] = useState(false);

    const toggleModalVisibility = () => {
        setModalVisible(!modalVisible);
    };

    const menuItems = [
        {
            url: withBasePath("overview"),
            icon: <Icon type="user" />,
            text: <span className="nav-text">Overview</span>,
            key: "overview",
        },
        {
            url: withBasePath("data/explorer"),
            icon: <Icon type="bar-chart" />,
            text: <span className="nav-text">Explorer</span>,
            disabled: !isOwner,
            key: "explorer",
        },
        {
            url: withBasePath("admin"),
            icon: <Icon type="user" />,
            text: <span className="nav-text">Admin</span>,
            disabled: !isOwner,
            children: [
                {
                    key: "admin-services",
                    url: withBasePath("admin/services"),
                    icon: <Icon type="dashboard" />,
                    text: <span className="nav-text">Services</span>,
                    disabled: !isOwner,
                },
                {
                    key: "admin-data-manager",
                    url: withBasePath("admin/data/manager"),
                    icon: <Icon type="folder-open" />,
                    text: <span className="nav-text">Data Manager</span>,
                    disabled: !isOwner,
                },
            ],
        },
        ...(user
            ? [
                {
                    key: "user-menu",
                    style: { float: "right" },
                    icon: <Icon type="user" />,
                    text: user.preferred_username,
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
                    text: <span className="nav-text">{authHasAttempted ? "Sign In" : "Loading..."}</span>,
                    onClick: () => (window.location.href = signInURLWithRedirect()),
                },
            ]),
        {
            url: withBasePath("notifications"),
            style: { float: "right" },
            disabled: !isOwner,
            icon: (
                <Badge dot count={unreadNotifications.length}>
                    <Icon type="bell" style={{ marginRight: "0" }} />
                </Badge>
            ),
            text: (
                <span className="nav-text" style={{ marginLeft: "10px" }}>
                    Notifications
                    {unreadNotifications.length > 0 ? <span> ({unreadNotifications.length})</span> : null}
                </span>
            ),
            onClick: () => dispatch(showNotificationDrawer()),
            key: "notifications",
        },
        {
            style: { float: "right" },
            icon: <Icon type="setting" />,
            text: <span className="nav-text">Settings</span>,
            onClick: toggleModalVisibility,
            key: "settings",
        },
    ];

    return <>
        <Layout.Header>
            <Link to={BASE_PATH}>
                <div style={{ margin: "0 15px 0 0", float: "left" }}>
                    <img style={{ height: "35px" }}
                         src={withBasePath("static/branding.png")}
                         alt={CUSTOM_HEADER || "Bento"} />
                </div>
            </Link>
            {CUSTOM_HEADER && (
                <h3 style={{ color: "rgba(255, 255, 255, 0.95)", float: "left", margin: "0 24px 0 0" }}>
                    {CUSTOM_HEADER}
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
        <OverviewSettingsControl modalVisible={modalVisible} toggleModalVisibility={toggleModalVisibility} />
    </>;
};

export default withRouter(SiteHeader);
