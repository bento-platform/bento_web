import { memo, type CSSProperties, type ReactNode } from "react";

import { useIsAuthenticated, usePerformAuth } from "bento-auth-js";

import { Button, Empty, Layout } from "antd";
import { LoginOutlined } from "@ant-design/icons";

import AutoAuthenticate from "./AutoAuthenticate";
import { useOpenIDConfigNotLoaded } from "@/hooks";

const styles: Record<string, CSSProperties> = {
  layout: { background: "white", padding: "48px 24px" },
  emptyImage: { height: "auto", marginBottom: "16px" },
};

const SignInIcon = memo(() => (
  <div style={{ textAlign: "center" }}>
    <LoginOutlined style={{ fontSize: 48 }} />
  </div>
));

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useIsAuthenticated();
  const performAuth = usePerformAuth();
  const openIdConfigNotLoaded = useOpenIDConfigNotLoaded();

  // If we are already authenticated, this component transparently renders its children. Otherwise, it presents an
  // info screen requesting that the user signs in.
  return (
    <AutoAuthenticate>
      {isAuthenticated ? (
        children
      ) : (
        <Layout.Content style={styles.layout}>
          <Empty
            image={<SignInIcon />}
            imageStyle={styles.emptyImage}
            description="You must sign into this node to access this page."
          >
            <Button type="primary" loading={openIdConfigNotLoaded} onClick={performAuth}>
              Sign In
            </Button>
          </Empty>
        </Layout.Content>
      )}
    </AutoAuthenticate>
  );
};

export default RequireAuth;
