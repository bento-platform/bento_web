import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "antd";

import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";


const ManagerRunsContent = () => (
    <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Routes>
                <Route path=":id/*" element={<RunDetailContent />} />
                <Route path="/" element={<RunListContent />} />
            </Routes>
        </Layout.Content>
    </Layout>
);

export default ManagerRunsContent;
