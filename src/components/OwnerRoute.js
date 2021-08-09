import React from "react";
import {connect} from "react-redux";
import {Route} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Empty, Icon, Layout} from "antd";

import {ROLE_OWNER, SIGN_OUT_URL} from "../constants";
import {signInURLWithRedirect, withBasePath} from "../utils/url";

const signInIcon = (
    <div style={{textAlign: "center"}}>
        <Icon type="login" style={{fontSize: 48}} />
    </div>
);

const OwnerRoute = ({component: Component, isSignedIn, shouldRedirect, path, ...rest}) => {
    const cleanedPath = path.length > 0 ? path.replace(/^\//, "") : path;
    return <Route {...rest} path={withBasePath(cleanedPath)} render={props => shouldRedirect
        ? (
            <Layout.Content style={{background: "white", padding: "48px 24px"}}>
                <Empty image={signInIcon}
                       imageStyle={{height: "auto", marginBottom: "16px"}}
                       description="You must sign in as an owner of this node to access this page.">
                    {isSignedIn
                        ? <Button onClick={() => window.location.href = withBasePath(SIGN_OUT_URL)}>
                            Sign Out</Button>
                        : <Button type="primary" onClick={() =>
                            window.location.href = signInURLWithRedirect()}>Sign In</Button>}
                </Empty>
            </Layout.Content>
        ) : <Component {...props} />} />;
};

OwnerRoute.propTypes = {
    component: PropTypes.elementType,
    isSignedIn: PropTypes.bool,
    shouldRedirect: PropTypes.bool,
    path: PropTypes.string,
};

const mapStateToProps = state => ({
    isSignedIn: state.auth.user !== null,
    shouldRedirect: state.auth.hasAttempted && state.auth.user?.chord_user_role !== ROLE_OWNER,
});

export default connect(mapStateToProps)(OwnerRoute);
