import { useEffect } from "react";

import { Layout, Divider } from "antd";

import { SITE_NAME } from "@/constants";
import SitePageHeader from "./SitePageHeader";
import ClinicalSummary from "./overview/ClinicalSummary";
import VariantsSummary from "./overview/VariantsSummary";
import ExperimentsSummary from "./overview/ExperimentsSummary";
import { useOverviewSummary } from "@/modules/metadata/hooks";

const styles = {
  pageHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: "white",
    borderBottom: "1px solid rgb(232, 232, 232)",
  },
  pageHeaderExtra: { border: "none" },
  overviewContent: { background: "white", padding: "32px 24px 4px" },
};

const OverviewContent = () => {
  useEffect(() => {
    document.title = `${SITE_NAME} - Overview`;
  }, []);

  const overviewSummary = useOverviewSummary();

  return (
    <>
      <div style={styles.pageHeaderContainer}>
        <SitePageHeader title="Overview" style={styles.pageHeaderExtra} />
      </div>
      <Layout>
        <Layout.Content style={styles.overviewContent}>
          <ClinicalSummary overviewSummary={overviewSummary} />
          <Divider />
          <ExperimentsSummary overviewSummary={overviewSummary} />
          <Divider />
          <VariantsSummary />
        </Layout.Content>
      </Layout>
    </>
  );
};

export default OverviewContent;
