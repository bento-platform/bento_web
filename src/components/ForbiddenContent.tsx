import React from "react";
import { Layout, Result } from "antd";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

export type ForbiddenContentProps = { message: React.ReactNode };

const ForbiddenContent = ({ message }: ForbiddenContentProps) => (
    <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Result status="error" title="Forbidden" subTitle={message} />
        </Layout.Content>
    </Layout>
);

ForbiddenContent.defaultProps = {
    message: "You do not have permission to view this content.",
};

export default ForbiddenContent;
