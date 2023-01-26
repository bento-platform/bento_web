import React, {useCallback, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";

import {Button, Divider, Drawer} from "antd";

import NotificationList from "./NotificationList";

import {hideNotificationDrawer, markAllNotificationsAsRead} from "../../modules/notifications/actions";
import {withBasePath} from "../../utils/url";


const NotificationDrawer = React.memo(() => {
    const dispatch = useDispatch();
    const history = useHistory();

    const markAllAsRead = useCallback(() => {
        dispatch(markAllNotificationsAsRead());
    }, []);
    const seeAllNotifications = useCallback(() => {
        dispatch(hideNotificationDrawer());
        history.push(withBasePath("notifications"));
    }, [dispatch, history]);
    const hideNotificationDrawer_ = useCallback(() => {
        dispatch(hideNotificationDrawer());
    }, [dispatch]);

    const notifications = useSelector(state => state.notifications.items);
    const unreadNotifications = useMemo(() => notifications.filter(n => !n.read), [notifications]);
    const isMarkingAllAsRead = useSelector(state => state.notifications.isMarkingAllAsRead);

    const notificationDrawerVisible = useSelector(state => state.notifications.drawerVisible);

    return <Drawer bodyStyle={{padding: 0}} title="Unread Notifications"
                   visible={notificationDrawerVisible}
                   width="500"
                   onClose={hideNotificationDrawer_}>
        <div style={{padding: "16px 24px", display: "flex", gap: "16px"}}>
            <Button style={{flex: 1}} onClick={markAllAsRead}
                    disabled={!unreadNotifications} loading={isMarkingAllAsRead}>Mark All as Read</Button>
            <Button style={{flex: 1}} onClick={seeAllNotifications}>See All Notifications</Button>
        </div>
        <Divider style={{margin: 0}} />
        <div style={{padding: "0 24px"}}>
            <NotificationList small={true} notifications={unreadNotifications} />
        </div>
    </Drawer>;
});

export default NotificationDrawer;
