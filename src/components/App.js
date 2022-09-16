import React, { useState, Suspense, lazy, useEffect } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import { withRouter, Redirect, Route, Switch, useHistory } from "react-router-dom";
import PropTypes from "prop-types";

import io from "socket.io-client";

import { Layout, Modal } from "antd";

import OwnerRoute from "./OwnerRoute";

import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SitePageLoading from "./SitePageLoading";

import { fetchDependentDataWithProvidedUser, fetchUserAndDependentData, setUser } from "../modules/auth/actions";
import { fetchPeersOrError } from "../modules/peers/actions";

import eventHandler from "../events";
import { nop } from "../utils/misc";
import { BASE_PATH, signInURLWithCustomRedirect, urlPath, withBasePath } from "../utils/url";

import SessionWorker from "../session.worker";
import { POPUP_AUTH_CALLBACK_URL } from "../constants";

// Lazy-load notification drawer
const NotificationDrawer = lazy(() => import("./notifications/NotificationDrawer"));

// Lazy-load route components
const OverviewContent = lazy(() => import("./OverviewContent"));
const DataDiscoveryContent = lazy(() => import("./DataDiscoveryContent"));
const DataExplorerContent = lazy(() => import("./DataExplorerContent"));
const AdminContent = lazy(() => import("./AdminContent"));
const NotificationsContent = lazy(() => import("./notifications/NotificationsContent"));

const SIGN_IN_WINDOW_FEATURES = "scrollbars=no, toolbar=no, menubar=no, width=800, height=600";

const App = ({}) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const nodeInfo = useSelector((state) => state.nodeInfo.data);
    const eventRelay = useSelector((state) => state.services.eventRelay);
    const user = useSelector((state) => state.auth.user);

    const [signedOutModal, setSignedOutModal] = useState(false);

    /** @type {null|io.Manager} */
    let eventRelayConnection = null;
    let pingInterval = null;
    let lastUser = false;
    let signInWindow = null;

    // Initialize a web worker which pings the user endpoint on a set
    // interval. This lets the application accept Set-Cookie headers which
    // keep the session ID up to date and prevent invalidating the session
    // incorrectly / early.
    // TODO: Refresh other data
    // TODO: Variable rate
    const sessionWorker = new SessionWorker();

    const clearPingInterval = () => {
        if (pingInterval === null) return;
        clearInterval(pingInterval);
        pingInterval = null;
    };

    const openSignInWindow = () => {
        const signInURL = signInURLWithCustomRedirect(`${nodeInfo.CHORD_URL}${POPUP_AUTH_CALLBACK_URL}`);
        if (!signInWindow || signInWindow.closed) {
            const popupTop = window.top.outerHeight / 2 + window.top.screenY - 350;
            const popupLeft = window.top.outerWidth / 2 + window.top.screenX - 400;
            signInWindow = window.open(
                signInURL,
                "Bento Sign In",
                `${SIGN_IN_WINDOW_FEATURES}, top=${popupTop}, left=${popupLeft}`
            );
        } else {
            signInWindow.focus();
        }
    };

    const createEventRelayConnectionIfNecessary = () => {
        eventRelayConnection = (() => {
            if (eventRelayConnection) {
                return eventRelayConnection;
            }

            // Don't bother trying to create the event relay connection if the user isn't authenticated
            if (!user) return null;

            const url = eventRelay?.url ?? null;
            return url
                ? (() =>
                      io(BASE_PATH, {
                          path: `${urlPath(url)}/private/socket.io`,
                          reconnection: !!user, // Only try to reconnect if we're authenticated
                      }).on("events", (message) => eventHandler(message, history)))()
                : null;
        })();
    };

    const handleUserChange = () => {
        if (lastUser && user === null) {
            // We got de-authenticated, so show a prompt...
            setSignedOutModal(true);
            // ... and disable constant websocket pinging if necessary by removing existing connections
            eventRelayConnection?.close();
            eventRelayConnection = null;
        } else if ((!lastUser || signedOutModal) && user) {
            // We got authenticated, so re-enable reconnection on the websocket..
            createEventRelayConnectionIfNecessary();
            // ... and minimize the sign-in prompt modal if necessary
            setSignedOutModal(false);
        }
        lastUser = !!user;
    };

    // TODO: Don't execute on focus if it's been checked recently
    const refreshUserAndDependentData = () => {
        dispatch(fetchUserAndDependentData(nop));
        handleUserChange();
    };

    useEffect(() => {

        dispatch(fetchUserAndDependentData(() => {
            dispatch(fetchPeersOrError());
            createEventRelayConnectionIfNecessary();
        }));

        // TODO: Refresh other data
        // TODO: Variable rate
        // this.pingInterval = setInterval(this.refreshUserAndDependentData, 30000);
        window.addEventListener("focus", () => refreshUserAndDependentData());

        sessionWorker.addEventListener("message", (msg) => {
            dispatch(fetchDependentDataWithProvidedUser(nop, setUser(msg.data.user)));
            handleUserChange();
        });
    }, []);

    // noinspection HtmlUnknownTarget
    return (
        <>
            <Modal
                title="You have been signed out"
                onOk={() => openSignInWindow()}
                onCancel={() => {
                    clearPingInterval(); // Stop pinging until the user decides to sign in again
                    setSignedOutModal(false); // Close the modal
                    // TODO: Set a new interval at a slower rate
                }}
                visible={signedOutModal}
            >
                Please <a onClick={() => openSignInWindow()}>sign in</a> (uses a popup window) to continue working.
            </Modal>
            <Layout style={{ minHeight: "100vh" }}>
                <Suspense fallback={<div />}>
                    <NotificationDrawer />
                </Suspense>
                <SiteHeader />
                <Layout.Content style={{ margin: "50px" }}>
                    <Suspense fallback={<SitePageLoading />}>
                        <Switch>
                            <OwnerRoute path={withBasePath("overview")} component={OverviewContent} />
                            <Route path={withBasePath("data/sets")} component={DataDiscoveryContent} />
                            <OwnerRoute path={withBasePath("data/explorer")} component={DataExplorerContent} />
                            <OwnerRoute path={withBasePath("admin")} component={AdminContent} />
                            <OwnerRoute path={withBasePath("notifications")} component={NotificationsContent} />
                            <Redirect from={BASE_PATH} to={withBasePath("overview")} />
                        </Switch>
                    </Suspense>
                </Layout.Content>
                <SiteFooter />
            </Layout>
        </>
    );

    // componentWillUnmount() {
    //     // TODO: DO WE NEED THIS FOR THE WORKER?
    //     // this.clearPingInterval();
    // }
};

App.propTypes = {
};

const mapStateToProps = (state) => ({

});

export default withRouter(
    connect(mapStateToProps, {
    })(App)
);
