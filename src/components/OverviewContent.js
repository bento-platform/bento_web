import React, { useEffect } from "react";
import { Layout, Divider } from "antd";

import SitePageHeader from "./SitePageHeader";
import ClinicalSummary from "./overview/ClinicalSummary";
import VariantsSummary from "./overview/VariantsSummary";
import { SITE_NAME } from "../constants";
import ExperimentsSummary from "./overview/ExperimentsSummary";

const OverviewContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Overview`;
    });

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "white",
                    borderBottom: "1px solid rgb(232, 232, 232)",
                }}
            >
                <SitePageHeader title="Overview" style={{ border: "none" }} />
            </div>
            <Layout>
                <Layout.Content
                    style={{
                        background: "white",
                        padding: "32px 24px 4px",
                    }}
                >
                    <ClinicalSummary />
                    <Divider />
                    <ExperimentsSummary />
                    <Divider />
                    <VariantsSummary />
                </Layout.Content>
            </Layout>
        </>
    );
};

export default OverviewContent;
