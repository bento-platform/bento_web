import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Divider, Drawer} from "antd";

import NotificationList from "./NotificationList";

import {hideNotificationDrawer} from "../../modules/notifications/actions";
import {withBasePath} from "../../utils/url";
import {notificationPropTypesShape} from "../../propTypes";


class NotificationDrawer extends Component {
    constructor(props) {
        super(props);
        this.seeAllNotifications = this.seeAllNotifications.bind(this);
    }

    markAllAsRead() {
        // TODO: Implement
    }

    seeAllNotifications() {
        this.props.hideNotificationDrawer();
        this.props.history.push(withBasePath("notifications"));
    }

    render() {
        const unreadNotifications = this.props.notifications.filter(n => !n.read);
        return <Drawer bodyStyle={{padding: 0}} title="Notifications"
                       visible={this.props.notificationDrawerVisible}
                       width="500"
                       onClose={() => this.props.hideNotificationDrawer()}>
            <div style={{padding: "16px 24px", display: "flex", gap: "16px"}}>
                <Button style={{flex: 1}} onClick={() => this.markAllAsRead()}
                        disabled={!unreadNotifications}>Mark All as Read</Button>
                <Button style={{flex: 1}} onClick={() => this.seeAllNotifications()}>See All Notifications</Button>
            </div>
            <Divider style={{margin: 0}} />
            <div style={{padding: "0 24px"}}>
                <NotificationList small={true} notifications={unreadNotifications} />
            </div>
        </Drawer>;
    }
}

NotificationDrawer.propTypes = {
    notificationDrawerVisible: PropTypes.bool,
    notifications: PropTypes.arrayOf(notificationPropTypesShape),

    hideNotificationDrawer: PropTypes.func,
};

const mapStateToProps = state => ({
    notificationDrawerVisible: state.notifications.drawerVisible,
    notifications: state.notifications.items,
});

export default withRouter(connect(mapStateToProps, {hideNotificationDrawer})(NotificationDrawer));
