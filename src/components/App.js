import React, { Suspense, lazy, useState, useEffect } from "react";
import { connect } from "react-redux";
import { withRouter, Redirect, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";

import io from "socket.io-client";

import { Layout, Modal } from "antd";

import OwnerRoute from "./OwnerRoute";

import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SitePageLoading from "./SitePageLoading";

import {
    fetchDependentDataWithProvidedUser,
    fetchUserAndDependentData,
    setUser,
} from "../modules/auth/actions";
import { fetchPeersOrError } from "../modules/peers/actions";

import eventHandler from "../events";
import { nop } from "../utils/misc";
import {
    BASE_PATH,
    signInURLWithCustomRedirect,
    urlPath,
    withBasePath,
} from "../utils/url";
import {
    nodeInfoDataPropTypesShape,
    serviceInfoPropTypesShape,
    userPropTypesShape,
} from "../propTypes";

import SessionWorker from "../session.worker";
import { POPUP_AUTH_CALLBACK_URL } from "../constants";

// Lazy-load notification drawer
const NotificationDrawer = lazy(() =>
    import("./notifications/NotificationDrawer")
);

// Lazy-load route components
const OverviewContent = lazy(() => import("./OverviewContent"));
const DataDiscoveryContent = lazy(() => import("./DataDiscoveryContent"));
const DataExplorerContent = lazy(() => import("./DataExplorerContent"));
const AdminContent = lazy(() => import("./AdminContent"));
const NotificationsContent = lazy(() =>
    import("./notifications/NotificationsContent")
);

const mapStateToProps = (state) => ({
    isFetchingNodeInfo: state.nodeInfo.isFetching,
    nodeInfo: state.nodeInfo.data,
    eventRelay: state.services.eventRelay,
    user: state.auth.user,
});

const SIGN_IN_WINDOW_FEATURES =
    "scrollbars=no, toolbar=no, menubar=no, width=800, height=600";

const App = ({
    nodeInfo,
    eventRelay,
    user,
    fetchUserAndDependentData,
    fetchPeersOrError,
    fetchDependentDataWithProvidedUser,
}) => {
    /** @type {null|io.Manager} */
    let eventRelayConnection = null;

    let pingInterval = null;
    let lastUser = false;

    const [signedOutModal, setSignedOutModal] = useState(false);

    let signInWindow = null;

    // Initialize a web worker which pings the user endpoint on a set
    // interval. This lets the application accept Set-Cookie headers which
    // keep the session ID up to date and prevent invalidating the session
    // incorrectly / early.
    // TODO: Refresh other data
    // TODO: Variable rate
    const sessionWorker = new SessionWorker();
    sessionWorker.addEventListener("message", async (msg) => {
        await fetchDependentDataWithProvidedUser(nop, setUser(msg.data.user));
        handleUserChange();
    });

    const clearPingInterval = () => {
        if (pingInterval === null) return;
        clearInterval(pingInterval);
        pingInterval = null;
    };

    const openSignInWindow = () => {
        const signInURL = signInURLWithCustomRedirect(
            `${nodeInfo.CHORD_URL}${POPUP_AUTH_CALLBACK_URL}`
        );
        if (!signInWindow || signInWindow.closed) {
            const popupTop =
                window.top.outerHeight / 2 + window.top.screenY - 350;
            const popupLeft =
                window.top.outerWidth / 2 + window.top.screenX - 400;
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
                      }).on("events", (message) =>
                          eventHandler(message, history)
                      ))()
                : null;
        })();
    };

    // TODO: Don't execute on focus if it's been checked recently
    const refreshUserAndDependentData = async () => {
        await fetchUserAndDependentData(nop);
        handleUserChange();
    };

    const handleUserChange = () => {
        if (lastUser && user === null) {
            // We got de-authenticated, so show a prompt...
            setSignedOutModal(false);
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

    useEffect(() => {
        () => {
            (async () => {
                await fetchUserAndDependentData(async () => {
                    await fetchPeersOrError();
                    createEventRelayConnectionIfNecessary();
                });

                // TODO: Refresh other data
                // TODO: Variable rate
                // pingInterval = setInterval(refreshUserAndDependentData, 30000);
                window.addEventListener("focus", () =>
                    refreshUserAndDependentData()
                );
            })();
        };

        return () => {
            // TODO: DO WE NEED THIS FOR THE WORKER?
            // clearPingInterval();
        };
    });

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
                Please <a onClick={() => openSignInWindow()}>sign in</a> (uses a
                popup window) to continue working.
            </Modal>
            <Layout style={{ minHeight: "100vh" }}>
                <Suspense fallback={<div />}>
                    <NotificationDrawer />
                </Suspense>
                <SiteHeader />
                <Layout.Content style={{ margin: "50px" }}>
                    <Suspense fallback={<SitePageLoading />}>
                        <Switch>
                            <OwnerRoute
                                path={withBasePath("overview")}
                                component={OverviewContent}
                            />
                            <Route
                                path={withBasePath("data/sets")}
                                component={DataDiscoveryContent}
                            />
                            <OwnerRoute
                                path={withBasePath("data/explorer")}
                                component={DataExplorerContent}
                            />
                            <OwnerRoute
                                path={withBasePath("admin")}
                                component={AdminContent}
                            />
                            <OwnerRoute
                                path={withBasePath("notifications")}
                                component={NotificationsContent}
                            />
                            <Redirect
                                from={BASE_PATH}
                                to={withBasePath("overview")}
                            />
                        </Switch>
                    </Suspense>
                </Layout.Content>
                <SiteFooter />
            </Layout>
        </>
    );
};

App.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    eventRelay: serviceInfoPropTypesShape,
    user: userPropTypesShape,

    fetchUserAndDependentData: PropTypes.func,
    fetchPeersOrError: PropTypes.func,
    fetchDependentDataWithProvidedUser: PropTypes.func,
};

export default withRouter(
    connect(mapStateToProps, {
        fetchDependentDataWithProvidedUser,
        fetchUserAndDependentData,
        fetchPeersOrError,
    })(App)
);
