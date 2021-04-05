import React, {Component, Suspense, lazy} from "react";
import {connect} from "react-redux";
import {withRouter, Redirect, Route, Switch} from "react-router-dom";
import PropTypes from "prop-types";

import io from "socket.io-client";

import {Layout, Modal} from "antd";
import "antd/es/layout/style/css";
import "antd/es/modal/style/css";

import OwnerRoute from "./OwnerRoute";

import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SitePageLoading from "./SitePageLoading";

import {fetchUserAndDependentData} from "../modules/auth/actions";
import {fetchPeersOrError} from "../modules/peers/actions";

import eventHandler from "../events";
import {nop} from "../utils/misc";
import {BASE_PATH, signInURLWithRedirect, urlPath, withBasePath} from "../utils/url";
import {serviceInfoPropTypesShape, userPropTypesShape} from "../propTypes";

import SessionWorker from "../session.worker";

// Lazy-load notification drawer
const NotificationDrawer = lazy(() => import("./notifications/NotificationDrawer"));

// Lazy-load route components
const OverviewContent = lazy(() => import("./OverviewContent"));
const DataDiscoveryContent = lazy(() => import("./DataDiscoveryContent"));
const DataExplorerContent = lazy(() => import("./DataExplorerContent"));
const AdminContent = lazy(() => import("./AdminContent"));
const NotificationsContent = lazy(() => import("./notifications/NotificationsContent"));

class App extends Component {
    constructor(props) {
        super(props);

        /** @type {null|io.Manager} */
        this.eventRelayConnection = null;

        this.pingInterval = null;
        this.lastUser = null;

        this.state = {
            signedOutModal: false
        };

        this.sessionWorker = new SessionWorker();
        this.sessionWorker.addEventListener("message", data => {
            console.log(data);
        });

        this.createEventRelayConnectionIfNecessary = this.createEventRelayConnectionIfNecessary.bind(this);
        this.refreshUserAndDependentData = this.refreshUserAndDependentData.bind(this);
    }

    clearPingInterval() {
        if (this.pingInterval === null) return;
        clearInterval(this.pingInterval);
        this.pingInterval = null;
    }

    render() {
        // noinspection HtmlUnknownTarget
        return <>
            <Modal title="You have been signed out"
                   onOk={() => window.location.href = signInURLWithRedirect()}
                   onCancel={() => {
                       this.clearPingInterval();  // Stop pinging until the user decides to sign in again
                       this.setState({signedOutModal: false});  // Close the modal
                       // TODO: Set a new interval at a slower rate
                   }}
                   visible={this.state.signedOutModal}>
                Please <a href={signInURLWithRedirect()}>sign in</a> again to continue working.
            </Modal>
            <Layout style={{minHeight: "100vh"}}>
                <Suspense fallback={<div />}>
                    <NotificationDrawer />
                </Suspense>
                <SiteHeader />
                <Layout.Content style={{margin: "50px"}}>
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
        </>;
    }

    createEventRelayConnectionIfNecessary() {
        this.eventRelayConnection = (() => {
            if (this.eventRelayConnection) {
                return this.eventRelayConnection;
            }

            // Don't bother trying to create the event relay connection if the user isn't authenticated
            if (!this.props.user) return null;

            const url = (this.props.eventRelay || {url: null}).url || null;
            return url ? (() => io(BASE_PATH, {
                path: `${urlPath(url)}/private/socket.io`,
                reconnection: !!this.props.user  // Only try to reconnect if we're authenticated
            }).on("events", message => eventHandler(message, this.props.history)))() : null;
        })();
    }

    // TODO: Don't execute on focus if it's been checked recently
    async refreshUserAndDependentData() {
        await this.props.fetchUserAndDependentData(nop);
        if (this.lastUser !== null && this.props.user === null) {
            // We got de-authenticated, so show a prompt...
            this.setState({signedOutModal: true});
            // ... and disable constant websocket pinging if necessary by removing existing connections
            if (this.eventRelayConnection) {
                this.eventRelayConnection.close();
                this.eventRelayConnection = null;
            }
        } else if (this.lastUser === null && this.props.user) {
            // We got authenticated, so re-enable reconnection on the websocket..
            this.createEventRelayConnectionIfNecessary();
            // ... and minimize the sign-in prompt modal if necessary
            this.setState({signedOutModal: false});
        }
        this.lastUser = this.props.user;
    }

    componentDidMount() {
        (async () => {
            await this.props.fetchUserAndDependentData(async () => {
                await this.props.fetchPeersOrError();
                this.createEventRelayConnectionIfNecessary();
            });

            // TODO: Refresh other data
            // TODO: Variable rate
            this.pingInterval = setInterval(this.refreshUserAndDependentData, 30000);
            window.addEventListener("focus", () => this.refreshUserAndDependentData());
        })();
    }

    componentWillUnmount() {
        this.clearPingInterval();
    }
}

App.propTypes = {
    isFetchingNodeInfo: PropTypes.bool,
    eventRelay: serviceInfoPropTypesShape,
    user: userPropTypesShape,

    fetchUserAndDependentData: PropTypes.func,
    fetchPeersOrError: PropTypes.func,
};

const mapStateToProps = state => ({
    isFetchingNodeInfo: state.nodeInfo.isFetching,
    eventRelay: state.services.eventRelay,
    user: state.auth.user
});

export default withRouter(connect(mapStateToProps, {
    fetchUserAndDependentData,
    fetchPeersOrError,
})(App));
