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

    seeAllNotifications() {
        this.props.hideNotificationDrawer();
        this.props.history.push(withBasePath("notifications"));
    }

    render() {
        return <Drawer title={"Notifications"}
                       visible={this.props.notificationDrawerVisible}
                       width="auto"
                       onClose={() => this.props.hideNotificationDrawer()}>
            <NotificationList small={true} notifications={this.props.notifications.filter(n => !n.read)} />
              <Divider />
              <Button type="link" style={{width: "100%"}} onClick={this.seeAllNotifications}>
                  See Read Notifications</Button>
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
