import React, {useCallback, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, List} from "antd";

import {markNotificationAsRead} from "../../modules/notifications/actions";

import {NOTIFICATION_WES_RUN_COMPLETED, NOTIFICATION_WES_RUN_FAILED, navigateToWESRun} from "../../utils/notifications";
import {notificationPropTypesShape} from "../../propTypes";


const sortNotificationTimestamps = (a, b) => b.timestamp - a.timestamp;

const notificationMetaStyle = {marginBottom: "8px"};
const notificationTimestampStyle = {
    color: "#999",
    float: "right",
    fontStyle: "italic",
    fontWeight: "normal",
};


const NotificationList = ({notifications, small}) => {
    const dispatch = useDispatch();
    const history = useHistory();

    /** @type boolean */
    const fetchingNotifications = useSelector(state => state.services.isFetchingAll || state.notifications.isFetching);

    const markAsRead = useCallback(id => dispatch(markNotificationAsRead(id)), [dispatch]);

    const getNotificationActions = useCallback(
        ({id, notification_type: notificationType, action_target: actionTarget}) => {
            switch (notificationType) {
                case NOTIFICATION_WES_RUN_COMPLETED:
                case NOTIFICATION_WES_RUN_FAILED:
                    return [
                        <Button key="run-details" onClick={() => {
                            // If they act on this notification, they read it.
                            markAsRead(id);
                            dispatch(navigateToWESRun(actionTarget, history));
                        }}>
                            Run Details
                        </Button>,
                    ];
                default:
                    return [];
            }
        }, [dispatch, history]);

    const listItemRender = useCallback(n => (
        <List.Item key={n.id} actions={[
            ...getNotificationActions(n),
            ...(n.read ? [] : [
                <Button key="mark-as-read"
                        type="link"
                        icon="read"
                        style={{padding: 0}}
                        onClick={() => markAsRead(n.id)}>
                    Mark as Read
                </Button>,
            ]),
        ]}>
            <List.Item.Meta
                title={<>{n.title} <span style={notificationTimestampStyle}>{n.timestamp.toLocaleString()}</span></>}
                style={notificationMetaStyle}
            />
            {n.description}
        </List.Item>
    ), [getNotificationActions, markAsRead]);

    const processedNotifications = useMemo(() => notifications.map(n => ({
        ...n,
        timestamp: new Date(Date.parse(n.timestamp)),
    })).sort(sortNotificationTimestamps), [notifications]);

    const isSmall = small ?? false;
    const pagination = useMemo(() => ({
        hideOnSinglePage: isSmall,
        pageSize: isSmall ? 5 : 10,
        size: isSmall ? "small" : "",
    }), [isSmall]);

    return (
        <List
            itemLayout="vertical"
            dataSource={processedNotifications}
            pagination={pagination}
            loading={fetchingNotifications}
            renderItem={listItemRender}
        />
    );
};

NotificationList.propTypes = {
    notifications: PropTypes.arrayOf(notificationPropTypesShape),
    small: PropTypes.bool,

    fetchingNotifications: PropTypes.bool,

    markNotificationAsRead: PropTypes.func,
    navigateToWESRun: PropTypes.func,
};

export default NotificationList;
