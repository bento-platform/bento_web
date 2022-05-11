import React from "react";

import { Layout, Typography } from "antd";

import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";

const ManagerAccessContent = () => {
    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={2}>Access Management</Typography.Title>
            </Layout.Content>
        </Layout>
    );
};

export default ManagerAccessContent;
