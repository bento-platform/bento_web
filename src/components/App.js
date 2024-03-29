import React, { Suspense, lazy, useRef, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { ChartConfigProvider } from "bento-charts";
import {
    fetchOpenIdConfiguration,
    useHandleCallback,
    getIsAuthenticated,
    checkIsInAuthPopup,
    useOpenSignInWindowCallback,
    usePopupOpenerAuthCallback,
    useSignInPopupTokenHandoff,
    useSessionWorkerTokenRefresh,
} from "bento-auth-js";

import * as io from "socket.io-client";

import { Layout, message, Modal } from "antd";

import { BENTO_URL_NO_TRAILING_SLASH, OPENID_CONFIG_URL } from "@/config";
import eventHandler from "@/events";
import SessionWorker from "@/session.worker";
import { nop } from "@/utils/misc";
import { fetchUserDependentData } from "@/modules/user/actions";

import NotificationDrawer from "./notifications/NotificationDrawer";
import RequireAuth from "./RequireAuth";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SitePageLoading from "./SitePageLoading";

// Lazy-load route components
const OverviewContent = lazy(() => import("./OverviewContent"));
const DataExplorerContent = lazy(() => import("./DataExplorerContent"));
const CBioPortalContent = lazy(() => import("./CBioPortalContent"));
const AdminContent = lazy(() => import("./AdminContent"));
const NotificationsContent = lazy(() => import("./notifications/NotificationsContent"));
const UserProfileContent = lazy(() => import("./UserProfileContent"));

const SIGN_IN_WINDOW_FEATURES = "scrollbars=no, toolbar=no, menubar=no, width=800, height=600";

const CALLBACK_PATH = "/callback";

const createSessionWorker = () => new SessionWorker();

const App = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const eventRelayConnection = useRef(null);
    const signInWindow = useRef(null);
    const windowMessageHandler = useRef(null);
    const pingInterval = useRef(null);
    const focusListener = useRef(undefined);

    const [signedOutModal, setSignedOutModal] = useState(false);

    const sessionWorker = useRef(null);

    const { accessToken, idTokenContents } = useSelector((state) => state.auth);
    const isAuthenticated = getIsAuthenticated(idTokenContents);

    const eventRelay = useSelector((state) => state.services.eventRelay);
    const eventRelayUrl = eventRelay?.url ?? null;

    const [lastIsAuthenticated, setLastIsAuthenticated] = useState(false);

    const [didPostLoadEffects, setDidPostLoadEffects] = useState(false);

    const isInAuthPopup = checkIsInAuthPopup(BENTO_URL_NO_TRAILING_SLASH);

    // Using the fetchUserDependentData thunk creator as a hook argument may lead to unwanted triggers on re-renders.
    // So we store the thunk inner function of the fetchUserDependentData thunk creator in a const.
    const onAuthSuccess = fetchUserDependentData(nop);

    const popupOpenerAuthCallback = usePopupOpenerAuthCallback();

    // Set up auth callback handling
    useHandleCallback(
        CALLBACK_PATH,
        onAuthSuccess,
        isInAuthPopup ? popupOpenerAuthCallback : undefined,
        (msg) => message.error(msg),
    );

    // Set up message handling from sign-in popup
    useSignInPopupTokenHandoff(windowMessageHandler);

    const createEventRelayConnectionIfNecessary = useCallback(() => {
        if (eventRelayConnection.current) return;
        eventRelayConnection.current = (() => {
            console.debug(
                `considering creating an event-relay connection: 
                is authenticated? ${isAuthenticated} | 
                have event relay? ${!!eventRelayUrl}`,
            );

            // Don't bother trying to create the event relay connection if the user isn't authenticated
            if (!isAuthenticated) return null;
            // ... or if we don't have the event relay (yet or at all)
            if (!eventRelayUrl) return null;

            const urlObj = new URL(eventRelayUrl);

            const manager = new io.Manager(urlObj.origin, {
                // path should get rewritten by the reverse proxy in front of event-relay if necessary:
                path: `${urlObj.pathname}/private/socket.io/`,
                reconnection: true,
            });
            const socket = manager.socket("/", {
                auth: {
                    token: accessToken,
                },
            }); // Connect to the main socket.io namespace on the server side
            socket.on("events", (message) => eventHandler(message, history));
            socket.on("connect_error", (err) => {
                console.error(`socket.io: connect_error - ${err.message}`);
            });
            return socket;
        })();
    }, [history, isAuthenticated, eventRelay, eventRelayConnection]);

    const handleUserChange = useCallback(() => {
        if (lastIsAuthenticated && !isAuthenticated) {
            // We got de-authenticated, so show a prompt...
            setSignedOutModal(true);
            // ... and disable constant websocket pinging if necessary by removing existing connections
            eventRelayConnection.current?.close();
            eventRelayConnection.current = null;
            // Finally, mark us as signed out so that any user change to non-null (signed-in) is detected.
            setLastIsAuthenticated(false);
        } else if ((!lastIsAuthenticated || signedOutModal) && isAuthenticated) {
            // Minimize the sign-in prompt modal if necessary
            setSignedOutModal(false);
            // Finally, mark us as signed in so that any user change to null (signed-out) is detected.
            setLastIsAuthenticated(true);

            // Fetch dependent data if we were authenticated
            dispatch(fetchUserDependentData(nop)).catch(console.error);

            // We got authenticated, so connect to the event relay if needed.
            createEventRelayConnectionIfNecessary();
        }
    }, [
        lastIsAuthenticated,
        isAuthenticated,
        signedOutModal,
        eventRelayConnection,
        createEventRelayConnectionIfNecessary,
    ]);

    useEffect(() => {
        if (eventRelayUrl) {
            createEventRelayConnectionIfNecessary();
        }
    }, [eventRelay, createEventRelayConnectionIfNecessary]);

    useEffect(() => {
        handleUserChange();
    }, [eventRelayConnection, lastIsAuthenticated, idTokenContents]);

    // TODO: Don't execute on focus if it's been checked recently
    useEffect(() => {
        if (focusListener.current === handleUserChange) return; // Same as before
        if (focusListener.current) window.removeEventListener("focus", focusListener.current);
        window.addEventListener("focus", handleUserChange);
        focusListener.current = handleUserChange;
    }, [focusListener, handleUserChange]);

    useEffect(() => {
        if (didPostLoadEffects) return;
        (async () => {
            await dispatch(fetchOpenIdConfiguration(OPENID_CONFIG_URL));
            await dispatch(fetchUserDependentData(createEventRelayConnectionIfNecessary));
            setDidPostLoadEffects(true);
        })();
    }, [dispatch, createEventRelayConnectionIfNecessary, didPostLoadEffects]);

    useSessionWorkerTokenRefresh(
        sessionWorker,
        createSessionWorker,
        onAuthSuccess,
    );

    const clearPingInterval = useCallback(() => {
        if (pingInterval.current === null) return;
        clearInterval(pingInterval.current);
        pingInterval.current = null;
    }, [pingInterval]);

    const openSignInWindow = useOpenSignInWindowCallback(signInWindow, SIGN_IN_WINDOW_FEATURES);

    // On the cBioPortal tab only, eliminate the margin around the content
    // to give as much space as possible to the cBioPortal application itself.
    const margin = window.location.pathname.endsWith("cbioportal") ? 0 : 26;

    if (isInAuthPopup) {
        return <div>Authenticating...</div>;
    }

    const threshold = useSelector((state) => state.explorer.otherThresholdPercentage) / 100;

    return (
        <>
            <ChartConfigProvider
                Lng="en"
                translationMap={{ en: { Count: "Count", Other: "Other" } }}
                globalThreshold={threshold}
            >
                <Modal
                    title="You have been signed out"
                    footer={null}
                    onCancel={() => {
                        clearPingInterval(); // Stop pinging until the user decides to sign in again
                        setSignedOutModal(false); // Close the modal
                    }}
                    open={signedOutModal}
                >
                    Please <a onClick={openSignInWindow}>sign in</a> (uses a popup window) to continue working.
                </Modal>
                <Layout style={{ minHeight: "100vh" }}>
                    <NotificationDrawer />
                    <SiteHeader />
                    <Layout.Content style={{ margin, display: "flex", flexDirection: "column" }}>
                        <Suspense fallback={<SitePageLoading />}>
                            <Switch>
                                <Route path={CALLBACK_PATH}><SitePageLoading /></Route>
                                <Route path="/overview"><RequireAuth><OverviewContent /></RequireAuth></Route>
                                <Route path="/data/explorer"><RequireAuth><DataExplorerContent /></RequireAuth></Route>
                                <Route path="/cbioportal"><RequireAuth><CBioPortalContent /></RequireAuth></Route>
                                <Route path="/admin"><RequireAuth><AdminContent /></RequireAuth></Route>
                                <Route path="/notifications"><RequireAuth><NotificationsContent /></RequireAuth></Route>
                                <Route path="/profile"><RequireAuth><UserProfileContent /></RequireAuth></Route>
                                <Route path="/" render={() => <Redirect to="/overview" />} />
                            </Switch>
                        </Suspense>
                    </Layout.Content>
                    <SiteFooter />
                </Layout>
            </ChartConfigProvider>
        </>
    );
};

export default App;
