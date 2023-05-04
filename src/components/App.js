import React, {Component, Suspense, lazy} from "react";
import {connect} from "react-redux";
import {withRouter, Redirect, Switch} from "react-router-dom";
import PropTypes from "prop-types";

import * as io from "socket.io-client";

import {Layout, Modal} from "antd";

import OwnerRoute from "./OwnerRoute";

import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SitePageLoading from "./SitePageLoading";

import {
    fetchOpenIdConfiguration,
    fetchDependentDataWithProvidedUser,
    fetchUserAndDependentData,
    setUser,
} from "../modules/auth/actions";

import eventHandler from "../events";
import {nop} from "../utils/misc";
import {BASE_PATH, signInURLWithCustomRedirect, withBasePath} from "../utils/url";
import {nodeInfoDataPropTypesShape, serviceInfoPropTypesShape, userPropTypesShape} from "../propTypes";

import SessionWorker from "../session.worker";
import {POPUP_AUTH_CALLBACK_URL} from "../constants";

// Lazy-load notification drawer
const NotificationDrawer = lazy(() => import("./notifications/NotificationDrawer"));

// Lazy-load route components
const OverviewContent = lazy(() => import("./OverviewContent"));
const DataExplorerContent = lazy(() => import("./DataExplorerContent"));
const CBioPortalContent = lazy(() => import("./CBioPortalContent"));
const AdminContent = lazy(() => import("./AdminContent"));
const NotificationsContent = lazy(() => import("./notifications/NotificationsContent"));

const SIGN_IN_WINDOW_FEATURES = "scrollbars=no, toolbar=no, menubar=no, width=800, height=600";

class App extends Component {
    constructor(props) {
        super(props);

        /** @type {null|io.Socket} */
        this.eventRelayConnection = null;

        this.pingInterval = null;
        this.lastUser = false;

        this.state = {
            signedOutModal: false
        };

        this.signInWindow = null;

        // Initialize a web worker which pings the user endpoint on a set
        // interval. This lets the application accept Set-Cookie headers which
        // keep the session ID up to date and prevent invalidating the session
        // incorrectly / early.
        // TODO: Refresh other data
        // TODO: Variable rate
        this.sessionWorker = new SessionWorker();
        this.sessionWorker.addEventListener("message", async msg => {
            await this.props.fetchDependentDataWithProvidedUser(nop, setUser(msg.data.user));
            this.handleUserChange();
        });

        this.createEventRelayConnectionIfNecessary = this.createEventRelayConnectionIfNecessary.bind(this);
        this.refreshUserAndDependentData = this.refreshUserAndDependentData.bind(this);
    }

    clearPingInterval() {
        if (this.pingInterval === null) return;
        clearInterval(this.pingInterval);
        this.pingInterval = null;
    }

    openSignInWindow() {
        const signInURL = signInURLWithCustomRedirect(
            `${this.props.nodeInfo.CHORD_URL}${POPUP_AUTH_CALLBACK_URL}`);
        if (!this.signInWindow || this.signInWindow.closed) {
            const popupTop = window.top.outerHeight / 2 + window.top.screenY - 350;
            const popupLeft = window.top.outerWidth / 2 + window.top.screenX - 400;
            this.signInWindow = window.open(
                signInURL,
                "Bento Sign In",
                `${SIGN_IN_WINDOW_FEATURES}, top=${popupTop}, left=${popupLeft}`);
        } else {
            this.signInWindow.focus();
        }
    }

    render() {
        // On the cBioPortal tab only, eliminate the margin around the content
        // to give as much space as possible to the cBioPortal application itself.
        const margin = window.location.pathname.endsWith("cbioportal") ? 0 : 26;

        // noinspection HtmlUnknownTarget
        return <>
            <Modal title="You have been signed out"
                   onOk={() => this.openSignInWindow()}
                   onCancel={() => {
                       this.clearPingInterval();  // Stop pinging until the user decides to sign in again
                       this.setState({signedOutModal: false});  // Close the modal
                       // TODO: Set a new interval at a slower rate
                   }}
                   visible={this.state.signedOutModal}>
                Please <a onClick={() => this.openSignInWindow()}>sign in</a> (uses a popup window) to continue working.
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
    }

    createEventRelayConnectionIfNecessary() {
        this.eventRelayConnection = (() => {
            if (this.eventRelayConnection) {
                return this.eventRelayConnection;
            }

            // Don't bother trying to create the event relay connection if the user isn't authenticated
            if (!this.props.user) return null;

            const url = this.props.eventRelay?.url ?? null;
            if (!url) return null;

            const urlObj = new URL(url);

            const manager = new io.Manager(urlObj.origin, {
                // path should get rewritten by the reverse proxy in front of event-relay if necessary:
                path: `${urlObj.pathname}/private/socket.io/`,
                // Only try to reconnect if we're authenticated:
                reconnection: !!this.props.user,
            });
            const socket = manager.socket("/");  // Connect to the main socket.io namespace on the server side
            socket.on("events", message => eventHandler(message, this.props.history));
            return socket;
        })();
    }

    // TODO: Don't execute on focus if it's been checked recently
    async refreshUserAndDependentData() {
        await this.props.fetchUserAndDependentData(nop);
        this.handleUserChange();
    }

    handleUserChange() {
        if (this.lastUser && this.props.user === null) {
            // We got de-authenticated, so show a prompt...
            this.setState({signedOutModal: true});
            // ... and disable constant websocket pinging if necessary by removing existing connections
            this.eventRelayConnection?.close();
            this.eventRelayConnection = null;
        } else if ((!this.lastUser || this.state.signedOutModal) && this.props.user) {
            // We got authenticated, so re-enable reconnection on the websocket..
            this.createEventRelayConnectionIfNecessary();
            // ... and minimize the sign-in prompt modal if necessary
            this.setState({signedOutModal: false});
        }
        this.lastUser = !!this.props.user;
    }

    componentDidMount() {
        (async () => {
            await this.props.fetchOpenIdConfiguration();

            await this.props.fetchUserAndDependentData(async () => {
                this.createEventRelayConnectionIfNecessary();
            });

            // TODO: Refresh other data
            // TODO: Variable rate
            // this.pingInterval = setInterval(this.refreshUserAndDependentData, 30000);
            window.addEventListener("focus", () => this.refreshUserAndDependentData());
        })();
    }

    componentWillUnmount() {
        // TODO: DO WE NEED THIS FOR THE WORKER?
        // this.clearPingInterval();
    }
}

App.propTypes = {
    isFetchingNodeInfo: PropTypes.bool,
    nodeInfo: nodeInfoDataPropTypesShape,
    eventRelay: serviceInfoPropTypesShape,
    user: userPropTypesShape,

    fetchUserAndDependentData: PropTypes.func,
    fetchDependentDataWithProvidedUser: PropTypes.func,
};

const mapStateToProps = state => ({
    isFetchingNodeInfo: state.nodeInfo.isFetching,
    nodeInfo: state.nodeInfo.data,
    eventRelay: state.services.eventRelay,
    user: state.auth.user
});

export default withRouter(connect(mapStateToProps, {
    fetchOpenIdConfiguration,
    fetchDependentDataWithProvidedUser,
    fetchUserAndDependentData,
})(App));
