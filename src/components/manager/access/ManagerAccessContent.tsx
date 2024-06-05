import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "antd";

import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import AccessTabs from "./AccessTabs";

const ManagerAccessContent = () => (
    <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Routes>
                <Route path=":tab" element={<AccessTabs />} />
                <Route path="/" element={<Navigate to="grants" replace={true} />} />
            </Routes>
        </Layout.Content>
    </Layout>
);

export default ManagerAccessContent;
