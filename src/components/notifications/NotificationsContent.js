import { memo } from "react";

import { Layout, Typography } from "antd";

import { useNotifications } from "@/modules/notifications/hooks";

import NotificationList from "./NotificationList";
import SitePageHeader from "../SitePageHeader";

const NotificationsContent = memo(() => {
  const ns = useNotifications().items;
  return (
    <>
      <SitePageHeader title="Notifications" />
      <Layout>
        <Layout.Content style={{ background: "white", padding: "16px 24px" }}>
          <Typography.Title level={3}>Unread</Typography.Title>
          <NotificationList notifications={ns.filter((n) => !n.read)} />
          <Typography.Title level={3} style={{ marginTop: "1.5rem" }}>
            Read
          </Typography.Title>
          <NotificationList notifications={ns.filter((n) => n.read)} />
        </Layout.Content>
      </Layout>
    </>
  );
});

export default NotificationsContent;
