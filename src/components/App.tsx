import { Suspense, lazy, useRef, useState, useEffect, useCallback } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ChartConfigProvider } from "bento-charts";
import {
  fetchOpenIdConfiguration,
  useHandleCallback,
  checkIsInAuthPopup,
  useOpenSignInWindowCallback,
  usePopupOpenerAuthCallback,
  useSignInPopupTokenHandoff,
  useSessionWorkerTokenRefresh,
  useAccessToken,
  useAuthState,
  useIsAuthenticated,
} from "bento-auth-js";

import * as io from "socket.io-client";
import type { Socket } from "socket.io-client";

import { Layout, message, Modal } from "antd";

import { BENTO_URL_NO_TRAILING_SLASH, OPENID_CONFIG_URL } from "@/config";
import eventHandler from "@/events";
import { useService } from "@/modules/services/hooks";
import { fetchUserDependentData } from "@/modules/user/actions";
import { useAppDispatch, useAppSelector } from "@/store";
import { nop } from "@/utils/misc";

import NotificationDrawer from "./notifications/NotificationDrawer";
import AutoAuthenticate from "./AutoAuthenticate";
import RequireAuth from "./RequireAuth";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SitePageLoading from "./SitePageLoading";

// Lazy-load route components
const HomeContent = lazy(() => import("./HomeContent"));
const DataExplorerContent = lazy(() => import("./DataExplorerContent"));
const DataManagerContent = lazy(() => import("./DataManagerContent"));
const ReferenceGenomesContent = lazy(() => import("./ReferenceGenomesContent"));
const CBioPortalContent = lazy(() => import("./CBioPortalContent"));
const NotificationsContent = lazy(() => import("./notifications/NotificationsContent"));
const ServiceContent = lazy(() => import("./ServiceContent"));
const ServiceDetail = lazy(() => import("./services/ServiceDetail"));
const UserProfileContent = lazy(() => import("./UserProfileContent"));

const SIGN_IN_WINDOW_FEATURES = "scrollbars=no, toolbar=no, menubar=no, width=800, height=600";

const CALLBACK_PATH = "/callback";

const createSessionWorker = () => new Worker(new URL("../session.worker.js", import.meta.url));

const uiErrorCallback = (msg: string) => message.error(msg);

const App = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const eventRelayConnection = useRef<Socket | null>(null);
  const signInWindow = useRef(null);
  const windowMessageHandler = useRef(null);

  const [signedOutModal, setSignedOutModal] = useState(false);

  const sessionWorker = useRef(null);

  const accessToken = useAccessToken();
  const { idTokenContents } = useAuthState();
  const isAuthenticated = useIsAuthenticated();

  const eventRelay = useService("event-relay");
  const eventRelayUrl = eventRelay?.url ?? null;

  const [lastIsAuthenticated, setLastIsAuthenticated] = useState(false);
  const [didPostLoadEffects, setDidPostLoadEffects] = useState(false);

  const isInAuthPopup = checkIsInAuthPopup(BENTO_URL_NO_TRAILING_SLASH);
  const popupOpenerAuthCallback = usePopupOpenerAuthCallback();

  const onAuthSuccess = useCallback(() => dispatch(fetchUserDependentData()), [dispatch]);

  // Set up auth callback handling
  useHandleCallback(CALLBACK_PATH, onAuthSuccess, isInAuthPopup ? popupOpenerAuthCallback : undefined, uiErrorCallback);

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
      socket.on("events", (message) => eventHandler(message, navigate));
      socket.on("connect_error", (err) => {
        console.error(`socket.io: connect_error - ${err.message}`);
      });
      return socket;
    })();
  }, [navigate, isAuthenticated, eventRelayUrl, eventRelayConnection, accessToken]);

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
    dispatch,
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
  }, [eventRelayUrl, createEventRelayConnectionIfNecessary]);

  useEffect(() => {
    handleUserChange();
  }, [handleUserChange, idTokenContents]);

  useEffect(() => {
    if (didPostLoadEffects) return;
    (async () => {
      await dispatch(fetchOpenIdConfiguration(OPENID_CONFIG_URL));
      await dispatch(fetchUserDependentData(createEventRelayConnectionIfNecessary));
      setDidPostLoadEffects(true);
    })();
  }, [dispatch, createEventRelayConnectionIfNecessary, didPostLoadEffects]);

  useSessionWorkerTokenRefresh(sessionWorker, createSessionWorker, onAuthSuccess);

  const openSignInWindow = useOpenSignInWindowCallback(signInWindow, SIGN_IN_WINDOW_FEATURES);

  // On the cBioPortal tab, eliminate the margin around the content to give as much space as possible to the
  // application itself.
  const margin = window.location.pathname.endsWith("cbioportal") ? 0 : 26;

  const threshold = useAppSelector((state) => state.explorer.otherThresholdPercentage) / 100;

  if (isInAuthPopup) {
    return <div>Authenticating...</div>;
  }

  return (
    <ChartConfigProvider
      Lng="en"
      translationMap={{ en: { Count: "Count", Other: "Other" }, fr: { Count: "Comptage", Other: "Autre" } }}
      globalThreshold={threshold}
    >
      <Modal
        title="You have been signed out"
        footer={null}
        onCancel={() => {
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
            <Routes>
              <Route path={CALLBACK_PATH} element={<SitePageLoading />} />
              <Route
                path="/home"
                element={
                  <AutoAuthenticate>
                    <HomeContent />
                  </AutoAuthenticate>
                }
              />
              <Route
                path="/data/explorer/*"
                element={
                  <RequireAuth>
                    <DataExplorerContent />
                  </RequireAuth>
                }
              />
              {/* Reference content is available to everyone to view, at least, so wrap it in an
                                AutoAuthenticate (to re-authenticate if we were before) rather than requiring auth. */}
              <Route
                path="/genomes"
                element={
                  <AutoAuthenticate>
                    <ReferenceGenomesContent />
                  </AutoAuthenticate>
                }
              />
              <Route
                path="/cbioportal"
                element={
                  <RequireAuth>
                    <CBioPortalContent />
                  </RequireAuth>
                }
              />
              <Route
                path="/services/:kind/*"
                element={
                  <RequireAuth>
                    <ServiceDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/services"
                element={
                  <RequireAuth>
                    <ServiceContent />
                  </RequireAuth>
                }
              />
              <Route
                path="/data/manager/*"
                element={
                  <RequireAuth>
                    <DataManagerContent />
                  </RequireAuth>
                }
              />
              <Route
                path="/notifications"
                element={
                  <RequireAuth>
                    <NotificationsContent />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <UserProfileContent />
                  </RequireAuth>
                }
              />
              <Route path="/*" element={<Navigate to="/home" replace={true} />} />
            </Routes>
          </Suspense>
        </Layout.Content>
        <SiteFooter />
      </Layout>
    </ChartConfigProvider>
  );
};

export default App;
