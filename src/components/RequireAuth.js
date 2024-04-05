import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { useAutoAuthenticate, useIsAuthenticated, usePerformAuth } from "bento-auth-js";

import { Button, Empty, Layout } from "antd";
import { LoginOutlined } from "@ant-design/icons";

import SitePageLoading from "./SitePageLoading";

const styles = {
    layout: { background: "white", padding: "48px 24px" },
    emptyImage: { height: "auto", marginBottom: "16px" },
};

const SignInIcon = React.memo(() => (
    <div style={{ textAlign: "center" }}>
        <LoginOutlined style={{ fontSize: 48 }} />
    </div>
));

const RequireAuth = ({ children }) => {
    const {
        hasAttempted: openIdConfigHasAttempted,
        isFetching: openIdConfigFetching,
    } = useSelector((state) => state.openIdConfiguration);
    const { isAutoAuthenticating } = useAutoAuthenticate();
    const isAuthenticated = useIsAuthenticated();
    const performAuth = usePerformAuth();

    // Need `=== false`, since if this is loaded from localStorage from a prior version, it'll be undefined and prevent
    // the page from showing.
    const openIdConfigNotLoaded = openIdConfigHasAttempted === false || openIdConfigFetching;

    if (openIdConfigNotLoaded || isAutoAuthenticating) {
        return <SitePageLoading />;
    }

    // If we are already authenticated, this component transparently renders its children. Otherwise, it presents an
    // info screen requesting that the user signs in.
    return isAuthenticated ? children : (
        <Layout.Content style={styles.layout}>
            <Empty
                image={<SignInIcon />}
                imageStyle={styles.emptyImage}
                description="You must sign into this node to access this page."
            >
                <Button type="primary" loading={openIdConfigNotLoaded} onClick={performAuth}>
                    Sign In
                </Button>
            </Empty>
        </Layout.Content>
    );
};

RequireAuth.propTypes = {
    children: PropTypes.node,
};

export default RequireAuth;
