import React, {Component} from "react";
import {connect} from "react-redux";
import {Layout, Divider} from "antd";

import SitePageHeader from "./SitePageHeader";
import ClinicalSummary from "./overview/ClinicalSummary";
import VariantsSummary from "./overview/VariantsSummary";
import { SITE_NAME } from "../constants";

const actionCreators = {};

const mapStateToProps = state => ({});

class OverviewContent extends Component {
    componentDidMount() {
        document.title = `${SITE_NAME} - Overview`;
    }

    render() {
        return <>
            <SitePageHeader title="Overview" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                    <ClinicalSummary />
                    <Divider />
                    <VariantsSummary />
                </Layout.Content>
            </Layout>
        </>;
    }
}

export default connect(mapStateToProps, actionCreators)(OverviewContent);
