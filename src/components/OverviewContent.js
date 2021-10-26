import React, {Component} from "react";
import {connect} from "react-redux";
import {Layout, Divider} from "antd";

import SitePageHeader from "./SitePageHeader";
import ClinicalSummary from "./overview/ClinicalSummary";
import VariantsSummary from "./overview/VariantsSummary";
import OverviewSettingsControl from "./overview/OverviewSettingsControl";
import { SITE_NAME } from "../constants";
import ExperimentsSummary from "./overview/ExperimentsSummary";
import { Modal, Button } from "antd";

const DEFAULT_OTHER_THRESHOLD_PERCENTAGE = 4;

const actionCreators = {};

const mapStateToProps = _state => ({});

class OverviewContent extends Component {
    constructor(props) {
        super(props);
        const startThreshold =
          JSON.parse(localStorage.getItem("otherThresholdPercentage")) ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE;
        this.state = { otherThresholdPercentage: startThreshold, modalVisible: false };
        this.setOtherThresholdPercentage = this.setOtherThresholdPercentage.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentDidMount() {
        document.title = `${SITE_NAME} - Overview`;
    }

    setOtherThresholdPercentage(value) {
        this.setState({otherThresholdPercentage: value});
    }

    openModal() {
        this.setState({modalVisible: true});
    }

    closeModal() {
        localStorage.setItem("otherThresholdPercentage", JSON.stringify(this.state.otherThresholdPercentage) );
        this.setState({modalVisible: false});
    }

    render() {
        return (
            <>
        <div style={{ display: "flex", background: "white", borderBottom: "1px solid rgb(232, 232, 232)" }}>
          <SitePageHeader title="Overview" style={{ border: "none" }} />
          <Button
            icon="setting"
            size={"small"}
            style={{ alignSelf: "center", marginLeft: "-20px" }}
            onClick={this.openModal}
          />
        </div>
        <Modal visible={this.state.modalVisible} onOk={this.closeModal} onCancel={this.closeModal}>
          <OverviewSettingsControl
            otherThresholdPercentage={this.state.otherThresholdPercentage}
            setOtherThresholdPercentage={this.setOtherThresholdPercentage}
          />
        </Modal>
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

export default connect(mapStateToProps, actionCreators)(OverviewContent);
