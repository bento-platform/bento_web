import type { ReactNode } from "react";
import { useEffect } from "react";
import { Layout, Result } from "antd";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

export type ForbiddenContentProps = { message?: ReactNode; debugState?: object };

const DEFAULT_MESSAGE = "You do not have permission to view this content.";

const ForbiddenContent = ({ message, debugState }: ForbiddenContentProps) => {
  message = message ?? DEFAULT_MESSAGE;

  useEffect(() => {
    if (debugState) {
      console.debug(`ForbiddenContent debug state (message: ${message}):`, debugState);
    }
  }, [debugState, message]);

  return (
    <Layout>
      <Layout.Content style={LAYOUT_CONTENT_STYLE}>
        <Result status="error" title="Forbidden" subTitle={message} />
      </Layout.Content>
    </Layout>
  );
};

export default ForbiddenContent;
