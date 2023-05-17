import React, {useMemo, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Badge, Icon, Layout, Menu } from "antd";

import { BENTO_CBIOPORTAL_ENABLED, CUSTOM_HEADER } from "../config";
import { showNotificationDrawer } from "../modules/notifications/actions";
import { matchingMenuKeys, renderMenuItem } from "../utils/menu";
import { BASE_PATH, withBasePath } from "../utils/url";

import OverviewSettingsControl from "./overview/OverviewSettingsControl";
import { performAuth } from "../lib/auth/performAuth";
import { signOut } from "../modules/auth/actions";


const LinkedLogo = React.memo(() =>
    <Link to={BASE_PATH}>
        <div style={{ margin: "0 20px 0 0", float: "left" }}>
            <img style={{ height: "32px", verticalAlign: "top", marginTop: "15px" }}
                 src={withBasePath("static/branding.png")}
                 alt={CUSTOM_HEADER || "Bento"} />
        </div>
    </Link>
);


const CustomHeaderText = React.memo(() =>
    <h1 style={{ color: "rgba(255, 255, 255, 0.95)", float: "left", margin: "0 24px 0 0" }}>
        {CUSTOM_HEADER}
    </h1>
);

const SiteHeader = () => {
    const dispatch = useDispatch();

    const {
        data: openIdConfig,
        isFetching: openIdConfigFetching,
    } = useSelector(state => state.openIdConfiguration);
    const authzEndpoint = openIdConfig?.["authorization_endpoint"];

    const unreadNotifications = useSelector(state => state.notifications.items.filter(n => !n.read));
    const {
        idTokenContents,
        isHandingOffCodeForToken,
        hasAttempted: authHasAttempted,
    } = useSelector(state => state.auth);
    const isAuthenticated = !!idTokenContents;

    const [modalVisible, setModalVisible] = useState(false);

    const toggleModalVisibility = () => {
        setModalVisible(!modalVisible);
    };

    const menuItems = useMemo(() => [
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
            disabled: !isAuthenticated,
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
            disabled: !isAuthenticated,
            children: [
                {
                    key: "admin-services",
                    url: withBasePath("admin/services"),
                    icon: <Icon type="dashboard" />,
                    text: "Services",
                    disabled: !isAuthenticated,
                },
                {
                    key: "admin-data-manager",
                    url: withBasePath("admin/data/manager"),
                    icon: <Icon type="folder-open" />,
                    text: "Data Manager",
                    disabled: !isAuthenticated,
                },
            ],
        },
        ...(isAuthenticated
            ? [
                {
                    key: "user-menu",
                    style: { float: "right" },
                    icon: <Icon type="user" />,
                    text: idTokenContents?.preferred_username,
                    children: [
                        {
                            key: "sign-out-link",
                            onClick: () => dispatch(signOut()),
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
                    text: <span className="nav-text">
                        {(openIdConfigFetching || isHandingOffCodeForToken) ? "Loading..." : "Sign In"}
                    </span>,
                    onClick: () => performAuth(authzEndpoint),
                },
            ]),
        {
            url: withBasePath("notifications"),
            style: { float: "right" },
            disabled: !isAuthenticated,
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
    ], [isAuthenticated, authHasAttempted, idTokenContents, unreadNotifications]);

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
