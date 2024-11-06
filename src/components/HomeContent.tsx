import { type CSSProperties, useEffect } from "react";
import { Link } from "react-router-dom";

import { Layout, Typography } from "antd";

import { CUSTOM_HEADER } from "@/config";
import { SITE_NAME } from "@/constants";
import { useCanQueryAtLeastOneProjectOrDataset, useManagerPermissions } from "@/modules/authz/hooks";

import SitePageHeader from "./SitePageHeader";

const styles: Record<string, CSSProperties> = {
  pageHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: "white",
    borderBottom: "1px solid rgb(232, 232, 232)",
  },
  pageHeaderExtra: { border: "none" },
  overviewContent: { background: "white", padding: "32px 24px 4px" },
};

const HomeContent = () => {
  useEffect(() => {
    document.title = `${SITE_NAME} - Home`;
  }, []);

  const { hasPermission: canQueryData } = useCanQueryAtLeastOneProjectOrDataset();
  const {
    permissions: { canManageAnything },
  } = useManagerPermissions();

  return (
    <>
      <div style={styles.pageHeaderContainer}>
        <SitePageHeader title="Home" style={styles.pageHeaderExtra} />
      </div>
      <Layout>
        <Layout.Content style={styles.overviewContent}>
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            Welcome to the {CUSTOM_HEADER || "Bento"} data portal!
          </Typography.Title>
          <Typography.Paragraph>
            {canQueryData && (
              <>
                To query data, go to the <Link to="/data/explorer">Explorer</Link>.<br />
              </>
            )}
            {canManageAnything && (
              <>
                To manage data, go to the <Link to="/data/manager">Data Manager</Link>.
              </>
            )}
          </Typography.Paragraph>
        </Layout.Content>
      </Layout>
    </>
  );
};

export default HomeContent;
