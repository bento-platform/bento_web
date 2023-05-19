import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Route} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Empty, Icon, Layout} from "antd";

import {LS_BENTO_WAS_SIGNED_IN, performAuth, setLSNotSignedIn} from "../lib/auth/performAuth";
import {withBasePath} from "../utils/url";

import SitePageLoading from "./SitePageLoading";
import {getIsAuthenticated} from "../lib/auth/utils";
import {signOut} from "../modules/auth/actions";

const signInIcon = (
    <div style={{textAlign: "center"}}>
        <Icon type="login" style={{fontSize: 48}} />
    </div>
);

const OwnerRoute = ({component: Component, path, ...rest}) => {
    const dispatch = useDispatch();

    const [isAutoAuthenticating, setIsAutoAuthenticating] = useState(false);

    const idTokenContents = useSelector(state => state.auth.idTokenContents);
    const isAuthenticated = getIsAuthenticated(idTokenContents);

    const {
        data: openIdConfig,
        isFetching: openIdConfigFetching,
    } = useSelector(state => state.openIdConfiguration);

    const authzEndpoint = openIdConfig?.["authorization_endpoint"];

    useEffect(() => {
        if (
            !isAuthenticated &&
            !isAutoAuthenticating &&
            authzEndpoint &&
            localStorage.getItem(LS_BENTO_WAS_SIGNED_IN) === "true"
        ) {
            console.debug("auto-authenticating");
            setLSNotSignedIn();
            setIsAutoAuthenticating(true);
            performAuth(authzEndpoint).catch(console.error);
        }
    }, [authzEndpoint, isAuthenticated, isAutoAuthenticating]);

    if (openIdConfigFetching || isAutoAuthenticating) {
        return <SitePageLoading />;
    }

    const cleanedPath = path.length > 0 ? path.replace(/^\//, "") : path;
    return <Route {...rest} path={withBasePath(cleanedPath)} render={props => !isAuthenticated
        ? (
            <Layout.Content style={{background: "white", padding: "48px 24px"}}>
                <Empty image={signInIcon}
                       imageStyle={{height: "auto", marginBottom: "16px"}}
                       description="You must sign into this node to access this page.">
                    {isAuthenticated
                        ? <Button onClick={() => dispatch(signOut())}>
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
