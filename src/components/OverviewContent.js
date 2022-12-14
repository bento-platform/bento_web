import React, { Component } from "react";
import { Layout, Divider } from "antd";

import SitePageHeader from "./SitePageHeader";
import ClinicalSummary from "./overview/ClinicalSummary";
import VariantsSummary from "./overview/VariantsSummary";
import { SITE_NAME } from "../constants";
import ExperimentsSummary from "./overview/ExperimentsSummary";

const styles = {
    pageHeaderContainer: {
        display: "flex",
        justifyContent: "space-between",
        background: "white",
        borderBottom: "1px solid rgb(232, 232, 232)",
    },
    pageHeaderExtra: {border: "none"},
    overviewContent: {background: "white", padding: "32px 24px 4px"},
}

const OverviewContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Overview`;
    }, []);

    return <>
        <div style={styles.pageHeaderContainer}>
            <SitePageHeader title="Overview" style={styles.pageHeaderExtra} />
        </div>
        <Layout>
            <Layout.Content style={styles.overviewContent}>
                <ClinicalSummary />
                <Divider />
                <ExperimentsSummary />
                <Divider />
                <VariantsSummary />
            </Layout.Content>
        </Layout>
    </>;
};

export default OverviewContent;
