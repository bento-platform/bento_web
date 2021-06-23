import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Col, Row, Spin, Statistic, Typography} from "antd";
import {VictoryAxis, VictoryChart, VictoryHistogram} from "victory";

import CustomPieChart from "./CustomPieChart";
import COLORS from "../../utils/colors";
import { setAutoQueryPageTransition } from "../../modules/explorer/actions";
import {
    experimentPropTypesShape,
    overviewSummaryPropTypesShape,
} from "../../propTypes";

const AGE_HISTOGRAM_BINS = [...Array(10).keys()].map(i => i * 10);


const mapStateToProps = state => ({
    experiments: state.experiments,
    overviewSummary: state.overviewSummary
});

const actionCreators = {
    setAutoQueryPageTransition
};

class ClinicalSummary extends Component {

    static propTypes = {
        experiments: PropTypes.shape({
            isFetching: PropTypes.bool,
            items: PropTypes.arrayOf(experimentPropTypesShape)
        }),
        overviewSummary: PropTypes.shape({
            isFetching: PropTypes.bool,
            data: overviewSummaryPropTypesShape
        }).isRequired,
        setAutoQueryPageTransition: PropTypes.func // temp
    };

    constructor(props) {
        super(props);
        this.state = {
            phenotypicFeaturesThresholdSliderValue: 0.01,
            chartPadding:  "1rem",
            chartWidthHeight: 500,
            chartLabelPaddingTop: 3,
            chartLabelPaddingLeft: 3,
        };
    }

    render() {
        const {overviewSummary} = this.props;
        const {data, isFetching} = overviewSummary;

        const numParticipants = data.data_type_specific?.individuals?.count;
        const numDiseases = data.data_type_specific?.diseases?.count;
        const numPhenotypicFeatures = overviewSummary.data?.data_type_specific?.phenotypic_features?.count;

        const biosampleLabels = mapNameValueFields(data.data_type_specific?.biosamples?.sampled_tissue);
        const numBiosamples = data.data_type_specific?.biosamples?.count;

        const sexLabels = mapNameValueFields(data.data_type_specific?.individuals?.sex, -1);

        const participantDOB = mapAgeXField(data.data_type_specific?.individuals?.age);

        const diseaseLabels = mapNameValueFields(data.data_type_specific?.diseases?.term);

        const phenotypicFeatureLabels = mapNameValueFields(
            data.data_type_specific?.phenotypic_features?.type,
            this.state.phenotypicFeaturesThresholdSliderValue);

        const experiments = this.props.experiments?.items ?? [];


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
                            <Statistic title="Experiments" value={experiments.length} />
                        </Spin>
                    </Col>
                </Row>
                <Col lg={12} md={24}>
                    <Row style={{display: "flex", justifyContent: "center"}}>
                        <Col style={{textAlign: "center"}}>
                            <h2>Sexes</h2>
                            <Spin spinning={isFetching}>
                                <CustomPieChart
                                    style={{cursor: "pointer"}}
                                    data={sexLabels}
                                    chartWidthHeight={this.state.chartWidthHeight}
                                    fieldLabel={"[dataset item].subject.sex"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                        </Col>
                    </Row>
                    <Row style={{paddingTop: this.state.chartLabelPaddingTop+"rem",
                        paddingLeft: this.state.chartPadding,
                        paddingRight: this.state.chartPadding,
                        paddingBottom: 0}}>
                        <Col style={{textAlign: "center"}}>
                            <h2>Age</h2>
                            <Spin spinning={isFetching}>
                                <VictoryChart>
                                    <VictoryAxis tickValues={AGE_HISTOGRAM_BINS}
                                                 label="Age (Years)"
                                                 height={this.state.chartWidthHeight}
                                                 style={{
                                                     axisLabel: { padding: 30 },
                                                 }} />
                                    <VictoryAxis dependentAxis={true}
                                                 label="Count"
                                                 style={{
                                                     axisLabel: { padding: 30},
                                                 }} />
                                    <VictoryHistogram
                                        data={participantDOB}
                                        bins={AGE_HISTOGRAM_BINS}
                                        style={{ data: { fill: COLORS[0] } }} />
                                </VictoryChart>
                            </Spin>
                        </Col>
                    </Row>
                </Col>
                <Col lg={12} md={24}>
                    <Row style={{display: "flex", justifyContent: "center"}}>
                        <Col style={{textAlign: "center"}}>
                            <h2>Diseases</h2>
                            <Spin spinning={isFetching}>
                                <CustomPieChart
                                    data={diseaseLabels}
                                    chartWidthHeight={this.state.chartWidthHeight}
                                    fieldLabel={"[dataset item].diseases.[item].term.label"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                        </Col>
                    </Row>
                    <Row style={{paddingTop: this.state.chartLabelPaddingTop+"rem",
                        display: "flex", justifyContent: "center"}}>
                        <Col style={{textAlign: "center"}}>
                            <h2>Biosamples</h2>
                            <Spin spinning={isFetching}>
                            <CustomPieChart
                                data={biosampleLabels}
                                chartWidthHeight={this.state.chartWidthHeight}
                                fieldLabel={"[dataset item].biosamples.[item].sampled_tissue.label"}
                                setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{display: "flex", justifyContent: "center"}}>
                <Col style={{textAlign: "center"}}>
                    <h2>Phenotypic Features</h2>
                    <Spin spinning={isFetching}>
                        <CustomPieChart
                            data={phenotypicFeatureLabels}
                            chartWidthHeight={this.state.chartWidthHeight}
                            fieldLabel={"[dataset item].phenotypic_features.[item].type.label"}
                            setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                        />
                    </Spin>
                </Col>
            </Row>
        </>;
    }

    updateDimensions = () => {
        if(window.innerWidth < 576) { //xs
            this.setState({
                chartPadding: "0rem",
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 3
            });
        } else if(window.innerWidth < 768) { // sm
            this.setState({
                chartPadding: "1rem",
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 6 });
        } else if(window.innerWidth < 992) { // md
            this.setState({
                chartPadding: "2rem",
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 5 });
        } else if(window.innerWidth < 1200) { // lg
            this.setState({
                chartPadding: "4rem",
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 6 });
        } else if(window.innerWidth < 1600) { // xl
            this.setState({
                chartPadding: "6rem",
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 7 });
        } else {
            this.setState({
                chartPadding: "10rem",
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 5,
                chartLabelPaddingLeft: 7 }); // > xl
        }
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }
}

export default connect(mapStateToProps, actionCreators)(ClinicalSummary);


function mapNameValueFields(data, otherThreshold=0.04) {
    if (!data)
        return [];

    // Accumulate all values to compute on them later
    const sumOfAllValues = Object.values(data).reduce((acc, v) => acc + v, 0);

    // Group the items in the array of objects denoted by
    // a "name" and "value" parameter
    const results = [];
    Object.entries(data).forEach(([key, val]) => {
        // Group all elements with a small enough value together under an "Other"
        if (val > 0 && (val / sumOfAllValues) < otherThreshold) {
            const otherIndex = results.findIndex(ob => ob.name === "Other");
            if (otherIndex > -1) {
                results[otherIndex].value += val; // Accumulate
            } else {
                results.push({name: "Other", value: val}); // Create a new  element in the array
            }
        } else { // Treat items
            results.push({name: key, value: val});
        }
    });

    // Sort by value
    return results.sort((a, b) => a.value - b.value);
}

function mapAgeXField(obj) {
    // Group the items in the array of objects denoted by
    // an "x" parameter
    return Object.entries(obj || {})
        .filter(([_, v]) => v > 0)
        .flatMap(([x, v]) => Array(v).fill({x}))
        .sort((a, b) =>  a.x - b.x);  // Sort by x
}
