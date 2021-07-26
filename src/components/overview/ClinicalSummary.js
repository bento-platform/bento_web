import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Col, Row, Spin, Statistic, Typography} from "antd";
import CustomPieChart from "./CustomPieChart";
import Histogram from "./Histogram";
import { setAutoQueryPageTransition } from "../../modules/explorer/actions";
import {
    overviewSummaryPropTypesShape,
} from "../../propTypes";
import {mapNameValueFields} from "../../utils/mapNameValueFields";

const mapStateToProps = state => ({
    overviewSummary: state.overviewSummary
});

const actionCreators = {
    setAutoQueryPageTransition
};

class ClinicalSummary extends Component {

    static propTypes = {
        overviewSummary: PropTypes.shape({
            isFetching: PropTypes.bool,
            data: overviewSummaryPropTypesShape
        }).isRequired,
        setAutoQueryPageTransition: PropTypes.func // temp
    };

    constructor(props) {
        super(props);
        this.state = {
            chartPadding:  "1rem",
            chartHeight: 300,
            chartAspectRatio: 1.8,
        };
    }

    render() {
        const {overviewSummary} = this.props;
        const {data, isFetching} = overviewSummary;

        const numParticipants = data.data_type_specific?.individuals?.count;
        const numDiseases = data.data_type_specific?.diseases?.count;
        const numPhenotypicFeatures = overviewSummary.data?.data_type_specific?.phenotypic_features?.count;
        const numExperiments = overviewSummary.data?.data_type_specific?.experiments?.count;

        const biosampleLabels = mapNameValueFields(data.data_type_specific?.biosamples?.sampled_tissue);
        const numBiosamples = data.data_type_specific?.biosamples?.count;

        const sexLabels = mapNameValueFields(data.data_type_specific?.individuals?.sex, -1);
        const binnedParticipantAges = binAges(data.data_type_specific?.individuals?.age);
        const diseaseLabels = mapNameValueFields(data.data_type_specific?.diseases?.term);
        const phenotypicFeatureLabels = mapNameValueFields(
            data.data_type_specific?.phenotypic_features?.type,
            this.state.phenotypicFeaturesThresholdSliderValue);
        const autoQueryDataType = "phenopacket"

        return <>
            <Row>
                <Typography.Title level={4}>
                    Clinical/Phenotypical Data
                </Typography.Title>
                <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic title="Participants" value={numParticipants} />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic title="Biosamples" value={numBiosamples} />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic title="Diseases" value={numDiseases} />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic title="Phenotypic Features" value={numPhenotypicFeatures} />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic title="Experiments" value={numExperiments} />
                        </Spin>
                    </Col>
                </Row>
                <Row style={{display: "flex", flexWrap: "wrap"}} >
            <Col style={{ textAlign: "center" }}>
              <Spin spinning={isFetching}>
                <CustomPieChart
                  title="Individuals"
                  data={sexLabels}
                  chartHeight={this.state.chartHeight}
                  chartAspectRatio={this.state.chartAspectRatio}
                  fieldLabel={"[dataset item].subject.sex"}
                  setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                  autoQueryDataType={autoQueryDataType}
                />
              </Spin>
            </Col>
            <Col  style={{ textAlign: "center" }}>
              <Spin spinning={isFetching}>
                <CustomPieChart
                  title="Diseases"
                  data={diseaseLabels}
                  chartHeight={this.state.chartHeight}
                  chartAspectRatio={this.state.chartAspectRatio}
                  fieldLabel={"[dataset item].diseases.[item].term.label"}
                  setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                  autoQueryDataType={autoQueryDataType}
                />
              </Spin>
            </Col>
            <Col  style={{ textAlign: "center" }}>
              <Spin spinning={isFetching}>
                <Histogram
                  title="Ages"
                  data={binnedParticipantAges}
                  chartAspectRatio={this.state.chartAspectRatio}
                  chartHeight={this.state.chartHeight}
                />
              </Spin>
            </Col>
            <Col style={{ textAlign: "center" }}>
              <Spin spinning={isFetching}>
                <CustomPieChart
                  title="Biosamples"
                  data={biosampleLabels}
                  chartHeight={this.state.chartHeight}
                  chartAspectRatio={this.state.chartAspectRatio}
                  fieldLabel={"[dataset item].biosamples.[item].sampled_tissue.label"}
                  setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                  autoQueryDataType={autoQueryDataType}
                />
              </Spin>
            </Col>
            <Col  style={{ textAlign: "center" }}>
              <Spin spinning={isFetching}>
                <CustomPieChart
                  title="Phenotypic Features"
                  data={phenotypicFeatureLabels}
                  chartHeight={this.state.chartHeight}
                  chartAspectRatio={this.state.chartAspectRatio}
                  fieldLabel={"[dataset item].phenotypic_features.[item].type.label"}
                  setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                  autoQueryDataType={autoQueryDataType}
                />
              </Spin>
            </Col>
          </Row>

            </Row>
        </>;
    }
}

export default connect(mapStateToProps, actionCreators)(ClinicalSummary);

// custom binning function
// input is object: {age1: count1, age2: count2....}
// outputs an array [{bin1: bin1count}, {bin2: bin2count}...]
function binAges (ages) {
    if (ages == null) {
        return null;
    }
    const ageBinCounts = {
        0: 0,
        10: 0,
        20: 0,
        30: 0,
        40: 0,
        50: 0,
        60: 0,
        70: 0,
        80: 0,
        90: 0,
        100: 0,
        110: 0,
    };

    for (const [age, count] of Object.entries(ages)) {
        const ageBin = 10 * Math.floor(Number(age) / 10);
        ageBinCounts[ageBin] += count;
    }

    // return histogram-friendly array
    return Object.keys(ageBinCounts).map(age => {
        return {ageBin: age, count: ageBinCounts[age]};
    });
}
