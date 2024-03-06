import React from "react";
import { useSelector } from "react-redux";
import { Route } from "react-router-dom";
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

const signInIcon = (
    <div style={{ textAlign: "center" }}>
        <LoginOutlined style={{ fontSize: 48 }} />
    </div>
);

const OwnerRoute = ({ component: Component, path, ...rest }) => {
    const { isFetching: openIdConfigFetching } = useSelector((state) => state.openIdConfiguration);
    const { isAutoAuthenticating } = useAutoAuthenticate();
    const isAuthenticated = useIsAuthenticated();
    const performAuth = usePerformAuth();
    const performSignOut = usePerformSignOut();

    if (openIdConfigFetching || isAutoAuthenticating) {
        return <SitePageLoading />;
    }

    return (
        <Route
            {...rest}
            path={path}
            render={(props) =>
                !isAuthenticated ? (
                    <Layout.Content style={{ background: "white", padding: "48px 24px" }}>
                        <Empty
                            image={signInIcon}
                            imageStyle={{ height: "auto", marginBottom: "16px" }}
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
                ) : (
                    <Component {...props} />
                )
            }
        />
    );
};

OwnerRoute.propTypes = {
    component: PropTypes.elementType,
    path: PropTypes.string,
};

export default OwnerRoute;
