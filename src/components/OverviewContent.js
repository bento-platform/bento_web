import React, {Component} from "react";
import {connect} from "react-redux";
import {Layout, Divider} from "antd";

import SitePageHeader from "./SitePageHeader";
import ClinicalSummary from "./overview/ClinicalSummary";
import VariantsSummary from "./overview/VariantsSummary";
import { SITE_NAME } from "../constants";
import ExperimentsSummary from "./overview/ExperimentsSummary";
import { InputNumber, Modal, Button } from "antd";

const DEFAULT_OTHER_THRESHOLD = 0.04;

const actionCreators = {};

const mapStateToProps = _state => ({});

class OverviewContent extends Component {
  constructor(props) {
    super(props);
    this.state = { otherThreshold: DEFAULT_OTHER_THRESHOLD, modalVisible: false };
    this.thresholdChange = this.thresholdChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this)
  }

  componentDidMount() {
    document.title = `${SITE_NAME} - Overview`;
  }

  thresholdChange(value) {
      this.setState({otherThreshold: value/100})  
      console.log({otherThreshold: this.state.otherThreshold})
  }

  toggleModal() {
    this.setState({modalVisible: !this.state.modalVisible})
  }

  otherText = () => <p>Other (%)</p>

  render() {
    return (
      <>
      <div style={{display: "flex", background: "white", borderBottom: "1px solid rgb(232, 232, 232)"}}>
        <SitePageHeader title="Overview" style={{border: "none"}}    />         
        <Button icon="setting" style={{}} onClick={this.toggleModal}/>
        </div> 
          <Modal
          visible={this.state.modalVisible}
          onOk={this.toggleModal}
          onCancel={this.toggleModal}
        >
            <InputNumber min={0} max={100} onChange={this.thresholdChange.bind(this)} addonBefore={this.otherText} defaultValue={4} controls={true} bordered={true} />
            <h3>Other (%)</h3>
        </Modal>
        <Layout>
          <Layout.Content style={{ background: "white", padding: "32px 24px 4px" }}>
            <ClinicalSummary otherThreshold={this.state.otherThreshold} />
            <Divider />
            <ExperimentsSummary otherThreshold={this.state.otherThreshold}/>
            <Divider />
            <VariantsSummary />
          </Layout.Content>
        </Layout>
      </>
    );
  }
}

export default connect(mapStateToProps, actionCreators)(OverviewContent);
