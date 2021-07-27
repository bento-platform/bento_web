import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Layout, Typography} from "antd";

import NotificationList from "./NotificationList";
import SitePageHeader from "../SitePageHeader";

import {notificationPropTypesShape} from "../../propTypes";


class NotificationsContent extends Component {
    render() {
        return <>
            <SitePageHeader title="Notifications" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "16px 24px"}}>
                    <Typography.Title level={3}>Unread</Typography.Title>
                    <NotificationList notifications={this.props.notifications.filter(n => !n.read)} />
                    <Typography.Title level={3} style={{marginTop: "1.5rem"}}>Read</Typography.Title>
                    <NotificationList notifications={this.props.notifications.filter(n => n.read)} />
                </Layout.Content>
            </Layout>
        </>;
    }
}

NotificationsContent.propTypes = {
    notifications: PropTypes.arrayOf(notificationPropTypesShape)
};

const mapStateToProps = state => ({
    notifications: state.notifications.items
});

export default connect(mapStateToProps)(NotificationsContent);
