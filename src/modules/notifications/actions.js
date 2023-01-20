import {basicAction, createNetworkActionTypes, networkAction} from "../../utils/actions";

export const SHOW_NOTIFICATION_DRAWER = "SHOW_NOTIFICATION_DRAWER";
export const HIDE_NOTIFICATION_DRAWER = "HIDE_NOTIFICATION_DRAWER";

export const showNotificationDrawer = basicAction(SHOW_NOTIFICATION_DRAWER);
export const hideNotificationDrawer = basicAction(HIDE_NOTIFICATION_DRAWER);

export const ADD_NOTIFICATION = "ADD_NOTIFICATION";

export const addNotification = data => ({
    type: ADD_NOTIFICATION,
    data
});

export const FETCH_NOTIFICATIONS = createNetworkActionTypes("FETCH_NOTIFICATIONS");
export const fetchNotifications = networkAction(() => (dispatch, getState) => ({
    types: FETCH_NOTIFICATIONS,
    url: `${getState().services.notificationService.url}/notifications`,
    err: "Error fetching notifications"
}));

export const MARK_NOTIFICATION_AS_READ = createNetworkActionTypes("MARK_NOTIFICATION_AS_READ");
export const markNotificationAsRead = networkAction(notificationID => (dispatch, getState) => ({
    types: MARK_NOTIFICATION_AS_READ,
    params: {notificationID},
    url: `${getState().services.notificationService.url}/notifications/${notificationID}/read`,
    req: {method: "PUT"},
    err: "Error marking notification as read"
}));

export const MARK_ALL_NOTIFICATIONS_AS_READ = createNetworkActionTypes("MARK_ALL_NOTIFICATIONS_AS_READ");
export const markAllNotificationsAsRead = networkAction(() => (dispatch, getState) => ({
    types: MARK_ALL_NOTIFICATIONS_AS_READ,
    url: `${getState().services.notificationService.url}/notifications/all-read`,
    req: {method: "PUT"},
    err: "Error marking all notifications as read"
}));
