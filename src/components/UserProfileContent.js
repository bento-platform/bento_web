import { Descriptions, Layout, Skeleton } from "antd";

import { useAuthState } from "bento-auth-js";

import SitePageHeader from "./SitePageHeader";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

const DESCRIPTIONS_STYLE = { maxWidth: 600 };

const UserProfileContent = () => {
  const { idTokenContents, isHandingOffCodeForToken, isRefreshingTokens } = useAuthState();

  const { preferred_username: username, email, iss, sub } = idTokenContents ?? {};

  return (
    <>
      <SitePageHeader title={`User Profile: ${username ?? email ?? sub}`} />
      <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
          {idTokenContents ? (
            <Descriptions bordered={true} style={DESCRIPTIONS_STYLE}>
              <Descriptions.Item label="Username" span={3}>
                {username}
              </Descriptions.Item>
              <Descriptions.Item label="Issuer" span={3}>
                {iss}
              </Descriptions.Item>
              <Descriptions.Item label="Subject ID" span={3}>
                {sub}
              </Descriptions.Item>
            </Descriptions>
          ) : isHandingOffCodeForToken || isRefreshingTokens ? (
            <Skeleton title={false} loading={true} />
          ) : (
            <div />
          )}
        </Layout.Content>
      </Layout>
    </>
  );
};

export default UserProfileContent;
