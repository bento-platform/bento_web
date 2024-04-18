import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    performAuth,
    RESOURCE_EVERYTHING,
    viewNotifications,
    useIsAuthenticated,
    usePerformSignOut,
} from "bento-auth-js";

import { Badge, Layout, Menu } from "antd";
import {
    BarChartOutlined,
    BellOutlined,
    DashboardOutlined,
    DotChartOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    LoginOutlined,
    LogoutOutlined,
    SettingOutlined,
    UserOutlined,
} from "@ant-design/icons";

import { AUTH_CALLBACK_URL, BENTO_CBIOPORTAL_ENABLED, CLIENT_ID, CUSTOM_HEADER } from "@/config";
import { useResourcePermissionsWrapper } from "@/hooks";
import { showNotificationDrawer } from "@/modules/notifications/actions";
import { useNotifications } from "@/modules/notifications/hooks";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import OverviewSettingsControl from "./overview/OverviewSettingsControl";

const LinkedLogo = React.memo(() => (
    <Link to="/">
        <div style={{ margin: "0 20px 0 0", float: "left" }}>
            <img
                style={{ height: "32px", verticalAlign: "top", marginTop: "15px" }}
                src="/static/branding.png"
                alt={CUSTOM_HEADER || "Bento"}
            />
        </div>
    </Link>
));

const CustomHeaderText = React.memo(() => (
    <h1 style={{ color: "rgba(255, 255, 255, 0.95)", float: "left", margin: "0 24px 0 0" }}>{CUSTOM_HEADER}</h1>
));

const SiteHeader = () => {
    const dispatch = useDispatch();

    const { permissions, isFetchingPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);
    const canViewNotifications = permissions.includes(viewNotifications);

    const { data: openIdConfig, isFetching: openIdConfigFetching } = useSelector((state) => state.openIdConfiguration);
    const authzEndpoint = openIdConfig?.["authorization_endpoint"];

    const { unreadItems: unreadNotifications } = useNotifications();

    const {
        idTokenContents,
        isHandingOffCodeForToken,
        hasAttempted: authHasAttempted,
    } = useSelector((state) => state.auth);
    const isAuthenticated = useIsAuthenticated();

    const [modalVisible, setModalVisible] = useState(false);

    const toggleModalVisibility = () => {
        setModalVisible(!modalVisible);
    };

    const performSignOut = usePerformSignOut();

    const menuItems = useMemo(
        () => [
            {
                url: "/overview",
                icon: <UserOutlined />,
                text: "Overview",
                key: "overview",
            },
            {
                url: "/data/explorer",
                icon: <BarChartOutlined />,
                text: "Explorer",
                disabled: !isAuthenticated,
                key: "explorer",
            },
            {
                url: "/genomes",
                icon: <FileTextOutlined />,
                text: "Reference Genomes",
                key: "genomes",
            },
            // TODO: Only show if admin / can data manage anything
            {
                key: "data-manager",
                url: "/data/manager",
                icon: <FolderOpenOutlined />,
                text: "Data Manager",
                disabled: !isAuthenticated,
            },
            {
                key: "services",
                url: "/services",
                icon: <DashboardOutlined />,
                text: "Services",
                disabled: !isAuthenticated,
            },
            // ---
            ...(BENTO_CBIOPORTAL_ENABLED
                ? [
                    {
                        url: "/cbioportal",
                        icon: <DotChartOutlined />,
                        text: "cBioPortal",
                        key: "cbioportal",
                    },
                ]
                : []),
            {
                style: { marginLeft: "auto" },
                icon: <SettingOutlined />,
                text: <span className="nav-text">Settings</span>,
                onClick: toggleModalVisibility,
                key: "settings",
            },
            {
                disabled: isFetchingPermissions || !canViewNotifications || !isAuthenticated,
                icon: (
                    <Badge dot count={unreadNotifications.length}>
                        <BellOutlined style={{ marginRight: 0, color: "rgba(255, 255, 255, 0.65)" }} />
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
            ...(isAuthenticated
                ? [
                    {
                        key: "user-menu",
                        icon: <UserOutlined />,
                        text: idTokenContents?.preferred_username,
                        children: [
                            {
                                key: "user-profile",
                                url: "/profile",
                                icon: <UserOutlined />,
                                text: "Profile",
                            },
                            {
                                key: "sign-out-link",
                                onClick: performSignOut,
                                icon: <LogoutOutlined />,
                                text: <span className="nav-text">Sign Out</span>,
                            },
                        ],
                    },
                ]
                : [
                    {
                        key: "sign-in",
                        icon: <LoginOutlined />,
                        text: (
                            <span className="nav-text">
                                {openIdConfigFetching || isHandingOffCodeForToken ? "Loading..." : "Sign In"}
                            </span>
                        ),
                        onClick: () => performAuth(authzEndpoint, CLIENT_ID, AUTH_CALLBACK_URL),
                    },
                ]),
        ],
        [isAuthenticated, authHasAttempted, idTokenContents, performSignOut, unreadNotifications],
    );

    return (
        <>
            <Layout.Header>
                <LinkedLogo />
                {CUSTOM_HEADER && <CustomHeaderText />}
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={matchingMenuKeys(menuItems)}
                    style={{ lineHeight: "64px" }}
                    items={menuItems.map((i) => transformMenuItem(i))}
                />
            </Layout.Header>
            <OverviewSettingsControl modalVisible={modalVisible} toggleModalVisibility={toggleModalVisibility} />
        </>
    );
};

export default SiteHeader;
