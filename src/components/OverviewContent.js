import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Col, Layout, Row, Spin, Statistic, Typography, Icon, Divider} from "antd";
import {VictoryAxis, VictoryChart, VictoryHistogram} from "victory";

import SitePageHeader from "./SitePageHeader";
import CustomPieChart from "./overview/CustomPieChart";
import {SITE_NAME} from "../constants";
import COLORS from "../utils/colors";
import {
    fetchPhenopackets,
    fetchExperiments,
    fetchVariantTableSummaries,
    fetchOverviewSummary
} from "../modules/metadata/actions";
import { setAutoQueryPageTransition } from "../modules/explorer/actions";
import {
    nodeInfoDataPropTypesShape,
    projectPropTypesShape,
    phenopacketPropTypesShape,
    experimentPropTypesShape,
    overviewSummaryPropTypesShape
} from "../propTypes";

const AGE_HISTOGRAM_BINS = [...Array(10).keys()].map(i => i * 10);


const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    isFetchingNodeInfo: state.nodeInfo.isFetching,
    projects: state.projects.items,
    isFetchingProjects: state.auth.isFetchingDependentData || state.projects.isFetching,
    peers: state.peers.items,
    isFetchingPeers: state.auth.isFetchingDependentData,
    phenopackets: state.phenopackets,
    experiments: state.experiments,
    tableSummaries: state.tableSummaries,
    overviewSummary: state.overviewSummary
});

const actionCreators = {
    fetchPhenopackets,
    fetchExperiments,
    fetchVariantTableSummaries,
    fetchOverviewSummary,
    setAutoQueryPageTransition
};

class OverviewContent extends Component {

    static propTypes = {
        nodeInfo: nodeInfoDataPropTypesShape,
        isFetchingNodeInfo: PropTypes.bool,

        projects: PropTypes.arrayOf(projectPropTypesShape),
        isFetchingProjects: PropTypes.bool,

        peers: PropTypes.arrayOf(PropTypes.string),
        isFetchingPeers: PropTypes.bool,

        phenopackets: PropTypes.shape({
            isFetching: PropTypes.bool,
            items: PropTypes.arrayOf(phenopacketPropTypesShape)
        }),

        experiments:PropTypes.shape({
            isFetching: PropTypes.bool,
            items: PropTypes.arrayOf(experimentPropTypesShape)
        }),

        overviewSummary: PropTypes.shape({
            isFetching: PropTypes.bool,
            data: overviewSummaryPropTypesShape
        }).isRequired,

        tableSummaries : PropTypes.shape({
            isFetching: PropTypes.bool,
            summariesByServiceArtifactAndTableID: PropTypes.object,
        }),

        fetchPhenopackets: PropTypes.func,
        fetchExperiments: PropTypes.func,
        fetchOverviewSummary: PropTypes.func,
        fetchVariantTableSummaries: PropTypes.func,
        setAutoQueryPageTransition: PropTypes.func // temp
    };

    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0,
            sexChartActiveIndex: 0,
            diseaseChartActiveIndex: 0,
            biosamplesChartActiveIndex: 0,
            phenotypicFeaturesThresholdSliderValue: 0.01,
            chartPadding:  "1rem",
            chartWidthHeight: 500,
            chartLabelPaddingTop: 3,
            chartLabelPaddingLeft: 3,
        };
    }

    onPFSliderChange = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            phenotypicFeaturesThresholdSliderValue: value,
        });
    };

    onPieEnter = (chartNum, data, index) => {
        // console.log(data)
        if (chartNum === 0) {
            this.setState({
                sexChartActiveIndex: index,
            });
        } else if (chartNum === 1) {
            this.setState({
                diseaseChartActiveIndex: index,
            });
        } else if (chartNum === 2) {
            this.setState({
                biosamplesChartActiveIndex: index,
            });
        }
    };

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

        const fetchingTableSummaries = this.props.tableSummaries?.isFetching;
        const variantTableSummaries =
            this.props.tableSummaries?.summariesByServiceArtifactAndTableID?.variant;

        let numVariants = 0;
        let numSamples = 0;
        let numVCFs = 0;
        Object.values(variantTableSummaries || []).forEach(s => {
            numVariants += s.count;
            numSamples += s.data_type_specific.samples;
            numVCFs += s.data_type_specific.vcf_files;
        });

        return <>
            <SitePageHeader title="Overview" subTitle="" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                    <Row>
                        <Typography.Title level={4}>Clinical/Phenotypical Data</Typography.Title>
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
                                    <h2>{isFetching ? "" : "Sexes"}</h2>
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
                                    <h2>{isFetching ? "" : "Age"}</h2>
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
                                    <h2>{isFetching ? "" : "Diseases"}</h2>
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
                                    <h2>{isFetching ? "" : "Biosamples"}</h2>
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
                            <h2>{isFetching ? "" : "Phenotypic Features"}</h2>
                            <Spin spinning={isFetching}>
                                <CustomPieChart
                                    data={phenotypicFeatureLabels}
                                    chartWidthHeight={this.state.chartWidthHeight}
                                    fieldLabel={"[dataset item].phenotypic_features.[item].type.label"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                        </Col>
                        {/* TODO: Adjust threshold dynamically
                        <Col>
                            <InputNumber
                                min={0}
                                max={1}
                                style={{ marginLeft: 16 }}
                                value={this.state.phenotypicFeaturesThresholdSliderValue}
                                onChange={this.onPFSliderChange}
                            />
                        </Col> */}
                    </Row>
                    <Divider />
                    <Typography.Title level={4}>Variants</Typography.Title>
                    <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                        <Col xl={3} lg={4} md={5} sm={7}>
                            <Spin spinning={fetchingTableSummaries}>
                                <Statistic title="Variants"
                                           value={numVariants} />
                            </Spin>
                        </Col>
                        <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                            <Spin spinning={fetchingTableSummaries}>
                                <Statistic title="Samples"
                                           value={numSamples} />
                            </Spin>
                        </Col>
                        <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                            <Spin spinning={fetchingTableSummaries}>
                                <Statistic title="VCF Files"
                                           prefix={<Icon type="file" />}
                                           value={numVCFs} />
                            </Spin>
                        </Col>
                    </Row>
                </Layout.Content>
            </Layout>
        </>;
    }

    /**
     * Calculate & Update state of new dimensions
     */
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

    /**
     * Add event listener
     */
    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);

        document.title = `${SITE_NAME} - Overview`;
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }
}

export default connect(mapStateToProps, actionCreators)(OverviewContent);


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
