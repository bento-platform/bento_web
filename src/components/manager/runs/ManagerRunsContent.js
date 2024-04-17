import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "antd";

import { RESOURCE_EVERYTHING, viewRuns } from "bento-auth-js";

import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";
import ForbiddenContent from "@/components/manager/ForbiddenContent";
import { useResourcePermissionsWrapper } from "@/hooks";


const ManagerRunsContent = () => {
    const { permissions, hasAttemptedPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

    if (hasAttemptedPermissions && !permissions.includes(viewRuns)) {
        return (
            <ForbiddenContent message="You do not have permission to view workflow runs." />
        );
    }

    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Routes>
                    <Route path=":id/*" element={<RunDetailContent />} />
                    <Route path="/" element={<RunListContent />} />
                </Routes>
            </Layout.Content>
        </Layout>
    );
};

export default ManagerRunsContent;
