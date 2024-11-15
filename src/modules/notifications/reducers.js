import {
  SHOW_NOTIFICATION_DRAWER,
  HIDE_NOTIFICATION_DRAWER,
  ADD_NOTIFICATION,
  FETCH_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
} from "./actions";

const unreadNotifications = (items) => items.filter((n) => !n.read);
const setMarkingAsRead = (i) => ({ ...i, isMarkingAsRead: true });
const setRead = (i) => ({ ...i, read: true });
const setNotMarkingAsRead = (i) => ({ ...i, isMarkingAsRead: false });

export const notifications = (
  state = {
    isFetching: false,
    isMarkingAsRead: false,
    isMarkingAllAsRead: false,
    drawerVisible: false,
    items: [],
    itemsByID: {},
    unreadItems: [],
  },
  action,
) => {
  const replaceNotificationInArray = (rp) => state.items.map((i) => (i.id === action.notificationID ? rp(i) : i));
  const replaceNotificationInObject = (rp) => ({
    ...state.itemsByID,
    [action.notificationID]: {
      ...(state.itemsByID[action.notificationID] ?? {}),
      ...rp(state.itemsByID[action.notificationID] ?? {}),
    },
  });

  switch (action.type) {
    case ADD_NOTIFICATION: {
      const items = [...state.items, action.data];
      return {
        ...state,
        items,
        unreadItems: unreadNotifications(items),
        itemsByID: {
          ...state.itemsByID,
          [action.data.id]: action.data,
        },
      };
    }

    case FETCH_NOTIFICATIONS.REQUEST:
      return { ...state, isFetching: true };
    case FETCH_NOTIFICATIONS.RECEIVE:
      return {
        ...state,
        items: action.data,
        unreadItems: unreadNotifications(action.data),
        itemsByID: Object.fromEntries(action.data.map((n) => [n.id, n])),
      };
    case FETCH_NOTIFICATIONS.FINISH:
      return { ...state, isFetching: false };

    case MARK_NOTIFICATION_AS_READ.REQUEST: {
      const items = replaceNotificationInArray(setMarkingAsRead);
      return {
        ...state,
        isMarkingAsRead: true,
        items,
        unreadItems: unreadNotifications(items),
        itemsByID: replaceNotificationInObject(setMarkingAsRead),
      };
    }
    case MARK_NOTIFICATION_AS_READ.RECEIVE: {
      const items = replaceNotificationInArray(setRead);
      return {
        ...state,
        items: items,
        unreadItems: unreadNotifications(items),
        itemsByID: replaceNotificationInObject(setRead),
      };
    }
    case MARK_NOTIFICATION_AS_READ.FINISH: {
      const items = replaceNotificationInArray(setNotMarkingAsRead);
      return {
        ...state,
        isMarkingAsRead: false,
        items,
        unreadItems: unreadNotifications(items), // should do nothing unless there's an error
        itemsByID: replaceNotificationInObject(setNotMarkingAsRead),
      };
    }

    case MARK_ALL_NOTIFICATIONS_AS_READ.REQUEST:
      return { ...state, isMarkingAllAsRead: true };
    case MARK_ALL_NOTIFICATIONS_AS_READ.RECEIVE:
      return {
        ...state,
        items: state.items.map((i) => (!i.read ? { ...i, read: true } : i)),
        unreadItems: [],
        itemsByID: Object.fromEntries(
          Object.entries(state.itemsByID).map(([k, v]) => [k, v.read ? v : { ...v, read: true }]),
        ),
      };
    case MARK_ALL_NOTIFICATIONS_AS_READ.FINISH:
      return { ...state, isMarkingAllAsRead: false };

    case SHOW_NOTIFICATION_DRAWER:
      return { ...state, drawerVisible: true };
    case HIDE_NOTIFICATION_DRAWER:
      return { ...state, drawerVisible: false };

    default:
      return state;
  }
};
