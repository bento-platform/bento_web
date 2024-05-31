import { memo, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { viewNotifications, useIsAuthenticated, usePerformSignOut, usePerformAuth, useAuthState } from "bento-auth-js";

import { Badge, Layout, Menu, Spin } from "antd";
import {
    BarChartOutlined,
    BellOutlined,
    DashboardOutlined,
    DotChartOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    LoadingOutlined,
    LoginOutlined,
    LogoutOutlined,
    PieChartOutlined,
    SettingOutlined,
    UserOutlined,
} from "@ant-design/icons";

import { BENTO_CBIOPORTAL_ENABLED, CUSTOM_HEADER } from "@/config";
import { useEverythingPermissions } from "@/hooks";
import { showNotificationDrawer } from "@/modules/notifications/actions";
import { useNotifications } from "@/modules/notifications/hooks";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import OverviewSettingsControl from "./overview/OverviewSettingsControl";
import { useCanQueryAtLeastOneProjectOrDataset, useManagerPermissions } from "@/modules/authz/hooks";

const LinkedLogo = memo(() => (
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

const CustomHeaderText = memo(() => (
    <h1 style={{ color: "rgba(255, 255, 255, 0.95)", float: "left", margin: "0 24px 0 0" }}>{CUSTOM_HEADER}</h1>
));

const SiteHeader = () => {
    const dispatch = useDispatch();

    const performAuth = usePerformAuth();

    const { permissions, isFetchingPermissions } = useEverythingPermissions();
    const canViewNotifications = useMemo(() => permissions.includes(viewNotifications), [permissions]);

    const {
        hasPermission: canQueryData,
        hasAttempted: hasAttemptedQueryPermissions,
    } = useCanQueryAtLeastOneProjectOrDataset();
    const { permissions: managerPermissions, hasAttempted: hasAttemptedManagerPermissions } = useManagerPermissions();

    const { isFetching: openIdConfigFetching } = useSelector((state) => state.openIdConfiguration);

    const { unreadItems: unreadNotifications } = useNotifications();

    const { idTokenContents, isHandingOffCodeForToken } = useAuthState();
    const isAuthenticated = useIsAuthenticated();

    const [modalVisible, setModalVisible] = useState(false);

    const toggleModalVisibility = useCallback(() => {
        setModalVisible(!modalVisible);
    }, [modalVisible]);

    const performSignOut = usePerformSignOut();

    const menuItems = useMemo(
        () => [
            {
                url: "/overview",
                icon: <PieChartOutlined />,
                text: "Overview",
                key: "overview",
            },
            ...(canQueryData ? [
                {
                    url: "/data/explorer",
                    icon: <BarChartOutlined />,
                    text: "Explorer",
                    key: "explorer",
                },
            ] : []),
            {
                url: "/genomes",
                icon: <FileTextOutlined />,
                text: "Reference Genomes",
                key: "genomes",
            },
            ...(managerPermissions.canManageAnything ? [
                {
                    key: "data-manager",
                    url: "/data/manager",
                    icon: <FolderOpenOutlined />,
                    text: "Data Manager",
                },
                // For now, only show the services page to users who can manage something, since it's not useful for
                // end users.
                {
                    key: "services",
                    url: "/services",
                    icon: <DashboardOutlined />,
                    text: "Services",
                },
            ] : []),
            ...((hasAttemptedQueryPermissions && hasAttemptedManagerPermissions) ? [] : [{
                key: "loading-admin",
                text: (
                    <Spin indicator={
                        <LoadingOutlined style={{
                            fontSize: 24,
                            marginTop: -4,
                            marginLeft: 16,
                            marginRight: 16,
                            color: "rgba(255, 255, 255, 0.65)",
                        }} />
                    } />
                ),
                disabled: true,
            }]),
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
                        onClick: () => performAuth(),
                    },
                ]),
        ],
        [
            dispatch,
            canQueryData,
            canViewNotifications,
            hasAttemptedManagerPermissions,
            hasAttemptedQueryPermissions,
            idTokenContents,
            isAuthenticated,
            isHandingOffCodeForToken,
            isFetchingPermissions,
            managerPermissions,
            openIdConfigFetching,
            performAuth,
            performSignOut,
            toggleModalVisibility,
            unreadNotifications,
        ],
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
