import React, {useMemo, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Badge, Icon, Layout, Menu } from "antd";

import {
    AUTH_CALLBACK_URL,
    BENTO_CBIOPORTAL_ENABLED,
    BENTO_URL_NO_TRAILING_SLASH,
    CLIENT_ID,
    CUSTOM_HEADER
} from "../config";
import { showNotificationDrawer } from "../modules/notifications/actions";
import { matchingMenuKeys, renderMenuItem } from "../utils/menu";

import OverviewSettingsControl from "./overview/OverviewSettingsControl";
import { performAuth, setLSNotSignedIn } from "../lib/auth/src/performAuth";
import { getIsAuthenticated } from "../lib/auth/src/utils";
import { signOut } from "../lib/auth/src/redux/authSlice";


const LinkedLogo = React.memo(() =>
    <Link to="/">
        <div style={{ margin: "0 20px 0 0", float: "left" }}>
            <img
                style={{ height: "32px", verticalAlign: "top", marginTop: "15px" }}
                src="/static/branding.png"
                alt={CUSTOM_HEADER || "Bento"}
            />
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

    const {
        data: openIdConfig,
        isFetching: openIdConfigFetching,
    } = useSelector(state => state.openIdConfiguration);
    const authzEndpoint = openIdConfig?.["authorization_endpoint"];

    const unreadNotifications = useSelector(state => state.notifications.items.filter(n => !n.read));
    const {
        idToken,
        idTokenContents,
        isHandingOffCodeForToken,
        hasAttempted: authHasAttempted,
    } = useSelector(state => state.auth);
    const isAuthenticated = getIsAuthenticated(idTokenContents);

    const [modalVisible, setModalVisible] = useState(false);

    const toggleModalVisibility = () => {
        setModalVisible(!modalVisible);
    };

    const menuItems = useMemo(() => [
        {
            url: "/overview",
            icon: <Icon type="user" />,
            text: "Overview",
            key: "overview",
        },
        {
            url: "/data/explorer",
            icon: <Icon type="bar-chart" />,
            text: "Explorer",
            disabled: !isAuthenticated,
            key: "explorer",
        },
        // TODO: Only if cBioPortal access is enabled for any project/dataset or something like that...
        ...(BENTO_CBIOPORTAL_ENABLED ? [
            {
                url: "/cbioportal",
                icon: <Icon type="dot-chart" />,
                text: "cBioPortal",
                key: "cbioportal",
            },
        ] : []),
        // TODO: Only show if admin / can data manage anything
        {
            url: "/admin",
            icon: <Icon type="user" />,
            text: "Admin",
            disabled: !isAuthenticated,
            children: [
                {
                    key: "admin-services",
                    url: "/admin/services",
                    icon: <Icon type="dashboard" />,
                    text: "Services",
                    disabled: !isAuthenticated,
                },
                {
                    key: "admin-data-manager",
                    url: "/admin/data/manager",
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
                            key: "user-profile",
                            url: "/profile",
                            icon: <Icon type="user" />,
                            text: "Profile",
                        },
                        {
                            key: "sign-out-link",
                            onClick: () => {
                                const endSessionEndpoint = openIdConfig?.["end_session_endpoint"];
                                if (!endSessionEndpoint) {
                                    dispatch(signOut());
                                } else {
                                    // Sign-out supported, so do that.
                                    const endSessionUrl = new URL(endSessionEndpoint);
                                    if (idToken) {
                                        endSessionUrl.searchParams.append("id_token_hint", idToken);
                                    }
                                    endSessionUrl.searchParams.append("client_id", CLIENT_ID);
                                    endSessionUrl.searchParams.append(
                                        "post_logout_redirect_uri", BENTO_URL_NO_TRAILING_SLASH + "/");
                                    setLSNotSignedIn();  // Make sure we don't immediately try to sign in again
                                    window.location.href = endSessionUrl.toString();
                                }
                            },
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
                    onClick: () => performAuth(authzEndpoint, CLIENT_ID, AUTH_CALLBACK_URL),
                },
            ]),
        {
            url: "/notifications",
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
