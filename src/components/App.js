import React, {Suspense, lazy, useRef, useState, useEffect, useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Redirect, Switch, useHistory} from "react-router-dom";

import * as io from "socket.io-client";

import {Layout, Modal} from "antd";

import OwnerRoute from "./OwnerRoute";

import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SitePageLoading from "./SitePageLoading";

import {
    fetchOpenIdConfigurationIfNeeded,
    fetchDependentDataWithProvidedUser,
    fetchUserAndDependentData,
    setUser,
} from "../modules/auth/actions";

import eventHandler from "../events";
import {nop} from "../utils/misc";
import {BASE_PATH, signInURLWithCustomRedirect, withBasePath} from "../utils/url";

import SessionWorker from "../session.worker";
import {POPUP_AUTH_CALLBACK_URL} from "../constants";
import {useHandleCallback} from "../lib/auth/performAuth";

// Lazy-load notification drawer
const NotificationDrawer = lazy(() => import("./notifications/NotificationDrawer"));

// Lazy-load route components
const OverviewContent = lazy(() => import("./OverviewContent"));
const DataExplorerContent = lazy(() => import("./DataExplorerContent"));
const CBioPortalContent = lazy(() => import("./CBioPortalContent"));
const AdminContent = lazy(() => import("./AdminContent"));
const NotificationsContent = lazy(() => import("./notifications/NotificationsContent"));

const SIGN_IN_WINDOW_FEATURES = "scrollbars=no, toolbar=no, menubar=no, width=800, height=600";

const App = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const eventRelayConnection = useRef(null);
    const signInWindow = useRef(null);
    const pingInterval = useRef(null);
    const focusListener = useRef(undefined);

    const [signedOutModal, setSignedOutModal] = useState(false);

    const sessionWorker = useRef(null);

    const user = useSelector(state => state.auth.user);
    const eventRelay = useSelector(state => state.services.eventRelay);
    const nodeInfo = useSelector(state => state.nodeInfo.data);
    const [lastUser, setLastUser] = useState(false);

    const [didPostLoadEffects, setDidPostLoadEffects] = useState(false);

    // Set up auth callback handling
    useHandleCallback();

    const createEventRelayConnectionIfNecessary = useCallback(() => {
        if (eventRelayConnection.current) return;
        eventRelayConnection.current = (() => {
            // Don't bother trying to create the event relay connection if the user isn't authenticated
            if (!user) return null;

            const url = eventRelay?.url ?? null;
            if (!url) return null;

            const urlObj = new URL(url);

            const manager = new io.Manager(urlObj.origin, {
                // path should get rewritten by the reverse proxy in front of event-relay if necessary:
                path: `${urlObj.pathname}/private/socket.io/`,
                // Only try to reconnect if we're authenticated:
                reconnection: !!user,
            });
            const socket = manager.socket("/");  // Connect to the main socket.io namespace on the server side
            socket.on("events", message => eventHandler(message, history));
            return socket;
        })();
    }, [history, user, eventRelay, eventRelayConnection]);

    const handleUserChange = useCallback(() => {
        if (lastUser && user === null) {
            // We got de-authenticated, so show a prompt...
            setSignedOutModal(true);
            // ... and disable constant websocket pinging if necessary by removing existing connections
            eventRelayConnection.current?.close();
            eventRelayConnection.current = null;
            // Finally, mark us as signed out so that any user change to non-null (signed-in) is detected.
            setLastUser(false);
        } else if ((!lastUser || signedOutModal) && user) {
            // We got authenticated, so re-enable reconnection on the websocket.
            createEventRelayConnectionIfNecessary();
            // ... and minimize the sign-in prompt modal if necessary
            setSignedOutModal(false);
            // Finally, mark us as signed in so that any user change to null (signed-out) is detected.
            setLastUser(true);
        }
    }, [lastUser, user, signedOutModal, eventRelayConnection, createEventRelayConnectionIfNecessary]);

    // TODO: Don't execute on focus if it's been checked recently
    const refreshUserAndDependentData = useCallback(() => {
        (async () => {
            await dispatch(fetchUserAndDependentData(nop));
            handleUserChange();
        })();
    }, [dispatch, handleUserChange]);

    useEffect(() => {
        // TODO: Refresh other data
        // TODO: Variable rate
        // this.pingInterval = setInterval(this.refreshUserAndDependentData, 30000);

        if (focusListener.current === refreshUserAndDependentData) return;  // Same as before
        if (focusListener.current) window.removeEventListener("focus", focusListener.current);
        window.addEventListener("focus", refreshUserAndDependentData);
        focusListener.current = refreshUserAndDependentData;
    }, [focusListener, refreshUserAndDependentData]);

    useEffect(() => {
        if (didPostLoadEffects) return;
        (async () => {
            await dispatch(fetchOpenIdConfigurationIfNeeded());
            await dispatch(fetchUserAndDependentData(createEventRelayConnectionIfNecessary));
            setDidPostLoadEffects(true);
        })();
    }, [dispatch, createEventRelayConnectionIfNecessary, didPostLoadEffects]);

    useEffect(() => {
        // initialize session refresh worker
        if (!sessionWorker.current) {
            const sw = new SessionWorker();
            sw.addEventListener("message", async msg => {
                dispatch(fetchDependentDataWithProvidedUser(nop, setUser(msg.data.user)));
            });
            sessionWorker.current = sw;
        }
    }, [sessionWorker]);

    const clearPingInterval = useCallback(() => {
        if (pingInterval.current === null) return;
        clearInterval(pingInterval.current);
        pingInterval.current = null;
    }, [pingInterval]);

    const openSignInWindow = useCallback(() => {
        const signInURL = signInURLWithCustomRedirect(
            `${nodeInfo.CHORD_URL}${POPUP_AUTH_CALLBACK_URL}`);

        if (!signInWindow.current || signInWindow.current.closed) {
            const popupTop = window.top.outerHeight / 2 + window.top.screenY - 350;
            const popupLeft = window.top.outerWidth / 2 + window.top.screenX - 400;
            signInWindow.current = window.open(
                signInURL,
                "Bento Sign In",
                `${SIGN_IN_WINDOW_FEATURES}, top=${popupTop}, left=${popupLeft}`);
        } else {
            signInWindow.current.focus();
        }
    }, [nodeInfo, signInWindow]);

    // On the cBioPortal tab only, eliminate the margin around the content
    // to give as much space as possible to the cBioPortal application itself.
    const margin = window.location.pathname.endsWith("cbioportal") ? 0 : 26;

    // noinspection HtmlUnknownTarget
    return <>
        <Modal title="You have been signed out"
               onOk={openSignInWindow}
               onCancel={() => {
                   clearPingInterval();  // Stop pinging until the user decides to sign in again
                   setSignedOutModal(false);  // Close the modal
                   // TODO: Set a new interval at a slower rate
               }}
               visible={signedOutModal}>
            Please <a onClick={openSignInWindow}>sign in</a> (uses a popup window) to continue working.
        </Modal>
        <Layout style={{minHeight: "100vh"}}>
            <Suspense fallback={<div />}>
                <NotificationDrawer />
            </Suspense>
            <SiteHeader />
            <Layout.Content style={{margin, display: "flex", flexDirection: "column"}}>
                <Suspense fallback={<SitePageLoading />}>
                    <Switch>
                        <OwnerRoute path={withBasePath("overview")} component={OverviewContent} />
                        <OwnerRoute path={withBasePath("data/explorer")} component={DataExplorerContent} />
                        <OwnerRoute path={withBasePath("cbioportal")} component={CBioPortalContent} />
                        <OwnerRoute path={withBasePath("admin")} component={AdminContent} />
                        <OwnerRoute path={withBasePath("notifications")} component={NotificationsContent} />
                        <Redirect from={BASE_PATH} to={withBasePath("overview")} />
                    </Switch>
                </Suspense>
            </Layout.Content>
            <SiteFooter />
        </Layout>
    </>;
};

export default App;
