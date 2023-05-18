import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Badge, Icon, Layout, Menu } from "antd";

import {BENTO_CBIOPORTAL_ENABLED, CUSTOM_HEADER} from "../config";
import { SIGN_OUT_URL } from "../constants";
import { showNotificationDrawer } from "../modules/notifications/actions";
import { matchingMenuKeys, renderMenuItem } from "../utils/menu";
import { BASE_PATH, signInURLWithRedirect, withBasePath } from "../utils/url";

import OverviewSettingsControl from "./overview/OverviewSettingsControl";


const LinkedLogo = React.memo(() =>
    <Link to={BASE_PATH}>
        <div style={{ margin: "0 20px 0 0", float: "left" }}>
            <img style={{ height: "32px", verticalAlign: "top", marginTop: "15px" }}
                 src={withBasePath("static/branding.png")}
                 alt={CUSTOM_HEADER || "Bento"} />
        </div>
    </Link>,
);


const CustomHeaderText = React.memo(() =>
    <h1 style={{ color: "rgba(255, 255, 255, 0.95)", float: "left", margin: "0 24px 0 0" }}>
        {CUSTOM_HEADER}
    </h1>,
);

const SiteHeader = () => {
    const dispatch = useDispatch();

    const unreadNotifications = useSelector(state => state.notifications.items.filter(n => !n.read));
    const { user, hasAttempted: authHasAttempted } = useSelector(state => state.auth);
    const isOwner = user?.chord_user_role === "owner";

    const [modalVisible, setModalVisible] = useState(false);

    const toggleModalVisibility = () => {
        setModalVisible(!modalVisible);
    };

    const menuItems = [
        {
            url: withBasePath("overview"),
            icon: <Icon type="user" />,
            text: "Overview",
            key: "overview",
        },
        {
            url: withBasePath("data/explorer"),
            icon: <Icon type="bar-chart" />,
            text: "Explorer",
            disabled: !isOwner,
            key: "explorer",
        },
        // TODO: Only if cBioPortal access is enabled for any project/dataset or something like that...
        ...(BENTO_CBIOPORTAL_ENABLED ? [
            {
                url: withBasePath("cbioportal"),
                icon: <Icon type="dot-chart" />,
                text: "cBioPortal",
                key: "cbioportal",
            },
        ] : []),
        // TODO: Only show if admin / can data manage anything
        {
            url: withBasePath("admin"),
            icon: <Icon type="user" />,
            text: "Admin",
            disabled: !isOwner,
            children: [
                {
                    key: "admin-services",
                    url: withBasePath("admin/services"),
                    icon: <Icon type="dashboard" />,
                    text: "Services",
                    disabled: !isOwner,
                },
                {
                    key: "admin-data-manager",
                    url: withBasePath("admin/data/manager"),
                    icon: <Icon type="folder-open" />,
                    text: "Data Manager",
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
            <LinkedLogo />
            {CUSTOM_HEADER && <CustomHeaderText />}
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={matchingMenuKeys(menuItems)}
                style={{ lineHeight: "64px" }}
            >
                {menuItems.map(i => renderMenuItem(i))}
            </Menu>
        </Layout.Header>
        <OverviewSettingsControl modalVisible={modalVisible} toggleModalVisibility={toggleModalVisibility} />
    </>;
};

export default withRouter(SiteHeader);
