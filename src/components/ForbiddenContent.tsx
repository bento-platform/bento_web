import type { ReactNode } from "react";
import { Layout, Result } from "antd";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

export type ForbiddenContentProps = { message?: ReactNode };

const DEFAULT_MESSAGE = "You do not have permission to view this content.";

const ForbiddenContent = ({ message }: ForbiddenContentProps) => (
  <Layout>
    <Layout.Content style={LAYOUT_CONTENT_STYLE}>
      <Result status="error" title="Forbidden" subTitle={message ?? DEFAULT_MESSAGE} />
    </Layout.Content>
  </Layout>
);

export default ForbiddenContent;
