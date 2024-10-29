import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Divider, Drawer } from "antd";

import NotificationList from "./NotificationList";

import { hideNotificationDrawer, markAllNotificationsAsRead } from "@/modules/notifications/actions";
import { useNotifications } from "@/modules/notifications/hooks";
import { useAppDispatch } from "@/store";

const NotificationDrawer = memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsAsRead()).catch((err) => console.error(err));
  }, [dispatch]);
  const seeAllNotifications = useCallback(() => {
    dispatch(hideNotificationDrawer());
    navigate("/notifications");
  }, [dispatch, navigate]);
  const hideNotificationDrawer_ = useCallback(() => {
    dispatch(hideNotificationDrawer());
  }, [dispatch]);

  const { unreadItems: unreadNotifications, isMarkingAllAsRead, drawerVisible } = useNotifications();

  return (
    <Drawer
      styles={{ body: { padding: 0 } }}
      title="Unread Notifications"
      open={drawerVisible}
      width={500}
      onClose={hideNotificationDrawer_}
    >
      <div style={{ padding: "16px 24px", display: "flex", gap: "16px" }}>
        <Button
          style={{ flex: 1 }}
          onClick={markAllAsRead}
          disabled={!unreadNotifications}
          loading={isMarkingAllAsRead}
        >
          Mark All as Read
        </Button>
        <Button style={{ flex: 1 }} onClick={seeAllNotifications}>
          See All Notifications
        </Button>
      </div>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: "0 24px" }}>
        <NotificationList small={true} notifications={unreadNotifications} />
      </div>
    </Drawer>
  );
});

export default NotificationDrawer;
