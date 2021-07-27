import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, List} from "antd";

import {markNotificationAsRead} from "../../modules/notifications/actions";

import {NOTIFICATION_WES_RUN_COMPLETED, NOTIFICATION_WES_RUN_FAILED, navigateToWESRun} from "../../utils/notifications";
import {notificationPropTypesShape} from "../../propTypes";


const sortNotificationTimestamps = (a, b) => b.timestamp - a.timestamp;


class NotificationList extends Component {
    constructor(props) {
        super(props);
        this.getNotificationActions = this.getNotificationActions.bind(this);
    }

    getNotificationActions(notification) {
        switch (notification.notification_type) {
            case NOTIFICATION_WES_RUN_COMPLETED:
            case NOTIFICATION_WES_RUN_FAILED:
                return [
                    <Button key="run-details" onClick={() => this.props.navigateToWESRun(notification.action_target)}>
                        Run Details
                    </Button>
                ];
            default:
                return [];
        }
    }

    render() {
        const processedNotifications = this.props.notifications.map(n => ({
            ...n,
            timestamp: new Date(Date.parse(n.timestamp))
        })).sort(sortNotificationTimestamps);

        const small = this.props.small || false;

        return (
            <List itemLayout="vertical"
                  dataSource={processedNotifications}
                  pagination={{
                      hideOnSinglePage: small,
                      pageSize: small ? 5 : 10,
                      size: small ? "small" : ""
                  }}
                  loading={this.props.fetchingNotifications}
                  renderItem={n => (
                      <List.Item key={n.id} actions={[
                          ...this.getNotificationActions(n),
                          <Button key="mark-as-read"
                                  type="link"
                                  icon="read"
                                  style={{padding: 0}}
                                  onClick={() => this.props.markNotificationAsRead(n.id)}>
                              Mark as Read
                          </Button>
                      ]}>
                          <List.Item.Meta title={n.title} description={n.description} style={{marginBottom: "8px"}} />
                          {n.timestamp.toLocaleString()}
                      </List.Item>
                  )} />
        );
    }
}

NotificationList.propTypes = {
    notifications: PropTypes.arrayOf(notificationPropTypesShape),
    small: PropTypes.bool,

    fetchingNotifications: PropTypes.bool,

    markNotificationAsRead: PropTypes.func,
    navigateToWESRun: PropTypes.func,
};


const mapStateToProps = state => ({
    fetchingNotifications: state.services.isFetchingAll || state.notifications.isFetching,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    ...bindActionCreators({markNotificationAsRead}, dispatch),
    navigateToWESRun: target => navigateToWESRun(target, dispatch, ownProps.history),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NotificationList));
