import React, { Component } from "react";
import { Layout, Divider } from "antd";

import SitePageHeader from "./SitePageHeader";
import ClinicalSummary from "./overview/ClinicalSummary";
import VariantsSummary from "./overview/VariantsSummary";
import { SITE_NAME } from "../constants";
import ExperimentsSummary from "./overview/ExperimentsSummary";
import { DEFAULT_OTHER_THRESHOLD_PERCENTAGE } from "../constants";

class OverviewContent extends Component {
    constructor(props) {
        super(props);
        const threshold =
      JSON.parse(localStorage.getItem("otherThresholdPercentage")) ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE;
        this.state = {
            otherThresholdPercentage: threshold,
        };
    }

    componentDidMount() {
        document.title = `${SITE_NAME} - Overview`;
    }

    render() {
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
          <Layout.Content style={{ background: "white", padding: "32px 24px 4px" }}>
            <ClinicalSummary otherThresholdPercentage={this.state.otherThresholdPercentage} />
            <Divider />
            <ExperimentsSummary otherThresholdPercentage={this.state.otherThresholdPercentage} />
            <Divider />
            <VariantsSummary />
          </Layout.Content>
        </Layout>
            </>
        );
    }
}

export default OverviewContent;
