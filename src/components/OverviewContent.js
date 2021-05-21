import React, {Component} from "react";
import {connect} from "react-redux";
import {Layout, Divider} from "antd";

import SitePageHeader from "./SitePageHeader";
import ClinicalSummary from "./overview/ClinicalSummary";


const mapStateToProps = state => ({});

const actionCreators = {};

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
