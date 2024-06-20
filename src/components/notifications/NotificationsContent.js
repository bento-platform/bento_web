import React from "react";
import { useSelector } from "react-redux";

import { Layout, Typography } from "antd";

import NotificationList from "./NotificationList";
import SitePageHeader from "../SitePageHeader";

const NotificationsContent = React.memo(() => {
  const ns = useSelector((state) => state.notifications.items);
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
