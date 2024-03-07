import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import {
    useAutoAuthenticate,
    useIsAuthenticated,
    usePerformAuth,
    usePerformSignOut,
} from "bento-auth-js";

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
    const { isFetching: openIdConfigFetching } = useSelector((state) => state.openIdConfiguration);
    const { isAutoAuthenticating } = useAutoAuthenticate();
    const isAuthenticated = useIsAuthenticated();
    const performAuth = usePerformAuth();
    const performSignOut = usePerformSignOut();

    if (openIdConfigFetching || isAutoAuthenticating) {
        return <SitePageLoading />;
    }

    return isAuthenticated ? children : (
        <Layout.Content style={styles.layout}>
            <Empty
                image={<SignInIcon />}
                imageStyle={styles.emptyImage}
                description="You must sign into this node to access this page."
            >
                {isAuthenticated ? (
                    <Button onClick={performSignOut}>Sign Out</Button>
                ) : (
                    <Button type="primary" loading={openIdConfigFetching} onClick={performAuth}>
                        Sign In
                    </Button>
                )}
            </Empty>
        </Layout.Content>
    );
};

RequireAuth.propTypes = {
    component: PropTypes.elementType,
    path: PropTypes.string,
};

export default RequireAuth;
