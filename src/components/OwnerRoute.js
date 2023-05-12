import React from "react";
import {useSelector} from "react-redux";
import {Route} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Empty, Icon, Layout} from "antd";

import {SIGN_OUT_URL} from "../constants";
import {performAuth} from "../lib/auth/performAuth";
import {withBasePath} from "../utils/url";

const signInIcon = (
    <div style={{textAlign: "center"}}>
        <Icon type="login" style={{fontSize: 48}} />
    </div>
);

const OwnerRoute = ({component: Component, path, ...rest}) => {
    const idTokenContents = useSelector(state => state.auth.idTokenContents);
    const exp = idTokenContents?.exp;

    const isSignedIn = idTokenContents;  // TODO: && exp

    const {
        data: openIdConfig,
        isFetching: openIdConfigFetching,
    } = useSelector(state => state.openIdConfiguration);

    const authzEndpoint = openIdConfig?.["authorization_endpoint"];
    // TODO: with redirect!
    // TODO: logic for displaying signed-out page:
    //  shouldRedirect: state.auth.hasAttempted && (state.auth.idTokenContents === null || false),

    const cleanedPath = path.length > 0 ? path.replace(/^\//, "") : path;
    return <Route {...rest} path={withBasePath(cleanedPath)} render={props => !isSignedIn
        ? (
            <Layout.Content style={{background: "white", padding: "48px 24px"}}>
                <Empty image={signInIcon}
                       imageStyle={{height: "auto", marginBottom: "16px"}}
                       description="You must sign into this node to access this page.">
                    {isSignedIn
                        ? <Button onClick={() => window.location.href = withBasePath(SIGN_OUT_URL)}>
                            Sign Out</Button>
                        : <Button
                            type="primary"
                            loading={openIdConfigFetching}
                            onClick={() => performAuth(authzEndpoint)}>Sign In</Button>}
                </Empty>
            </Layout.Content>
        ) : <Component {...props} />} />;
};

OwnerRoute.propTypes = {
    component: PropTypes.elementType,
    path: PropTypes.string,
};

export default OwnerRoute;
