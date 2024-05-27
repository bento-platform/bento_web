import React, { Suspense, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Menu, Skeleton } from "antd";

import SitePageHeader from "../SitePageHeader";
import ServiceOverview from "./ServiceOverview";
import ServiceLogs from "./ServiceLogs"

import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

const styles = {
    // TODO: Deduplicate with data manager
    menu: {
        marginLeft: "-24px",
        marginRight: "-24px",
        marginTop: "-12px",
    },
    suspenseFallback: {
        padding: "24px",
        backgroundColor: "white",
    },
};

const SuspenseFallback = React.memo(() => (
    <div style={styles.suspenseFallback}><Skeleton active /></div>
));

const ServiceDetail = () => {
    // TODO: 404
    const navigate = useNavigate();
    const { kind } = useParams();

    const serviceInfoByKind = useSelector((state) => state.services.itemsByKind);

    const serviceInfo = useMemo(() => serviceInfoByKind[kind], [kind, serviceInfoByKind]);

    const menuItems = useMemo(() => [
        { url: `/services/${kind}/overview`, style: { marginLeft: "4px" }, text: "Overview" },
        { url: `/services/${kind}/logs`, style: { marginLeft: "4px" }, text: "Logs" }
    ], [kind]);
    const selectedKeys = matchingMenuKeys(menuItems);

    const onBack = useCallback(() => navigate("/services"), [navigate]);

    return (
        <>
            <SitePageHeader
                title={serviceInfo?.name || ""}
                subTitle={serviceInfo?.description || ""}
                footer={
                    <Menu
                        mode="horizontal"
                        style={styles.menu}
                        selectedKeys={selectedKeys}
                        items={menuItems.map(transformMenuItem)}
                    />
                }
                withTabBar={true}
                onBack={onBack}
            />
            <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                    <Route path="overview" element={<ServiceOverview />} />
                    <Route path="logs" element={<ServiceLogs />} />
                    <Route path="/" element={<Navigate to="overview" replace={true} />} />
                </Routes>
            </Suspense>
        </>
    );
};

export default ServiceDetail;
