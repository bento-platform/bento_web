import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Col, Row, Spin, Statistic, Typography} from "antd";
import CustomPieChart from "./CustomPieChart";
import { setAutoQueryPageTransition } from "../../modules/explorer/actions";
import {
    overviewSummaryPropTypesShape,
} from "../../propTypes";
import {mapNameValueFields} from "../../utils/mapNameValueFields"

const mapStateToProps = state => ({
    overviewSummary: state.overviewSummary
});

const actionCreators = {
    setAutoQueryPageTransition
};

class ExperimentsSummary2 extends Component {

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
            phenotypicFeaturesThresholdSliderValue: 0.01,
            chartPadding:  "1rem",
            chartHeight: 300,
            chartAspectRatio: 1.6,
            chartLabelPaddingTop: 3,
            chartLabelPaddingLeft: 3,
        };
    }

    render() {
        const {overviewSummary} = this.props;
        const {data, isFetching} = overviewSummary;

        // TODO: most of these have "other" categories, so counts here are ambiguous or simply incorrect
        const numExperiments = overviewSummary.data?.data_type_specific?.experiments?.count;
        const numStudyTypes = Object.keys(overviewSummary.data?.data_type_specific?.experiments?.study_type|| {}).length;
        const numExperimentTypes = Object.keys(overviewSummary.data?.data_type_specific?.experiments?.experiment_type || {}).length 
        const numMoleculesUsed = Object.keys(overviewSummary.data?.data_type_specific?.experiments?.molecule|| {}).length;
        const numLibrarySources = Object.keys(overviewSummary.data?.data_type_specific?.experiments?.library_source|| {}).length;
        const numLibraryStrategies = Object.keys(overviewSummary.data?.data_type_specific?.experiments?.library_strategy|| {}).length;
        const numLibrarySelections = Object.keys(overviewSummary.data?.data_type_specific?.experiments?.library_selection|| {}).length;

        // extract data in pie chart format
        const experimentTypeData = mapNameValueFields(data.data_type_specific?.experiments?.experiment_type);
        const studyTypeData = mapNameValueFields(data.data_type_specific?.experiments?.study_type);
        const moleculeData = mapNameValueFields(data.data_type_specific?.experiments?.molecule);
        const libraryStrategyData = mapNameValueFields(data.data_type_specific?.experiments?.library_strategy);
        const librarySelectionData = mapNameValueFields(data.data_type_specific?.experiments?.library_selection);
        const biosamplesExperimentalData = mapNameValueFields(data.data_type_specific?.experiments?.biosamples);

        const pieRowStyle = {display: "flex", flexWrap: "wrap"}    

        return <>
            <Row>
                <Typography.Title level={4}>
                    Experiments 
                </Typography.Title>
                <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic title="Experiments" value={numExperiments}/>
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>   
                        <Spin spinning={isFetching}>
                            <Statistic title="Experiment Types" value={numExperimentTypes} />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic title="Molecules Used" value={numMoleculesUsed} />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic title="Library Strategies" value={numLibraryStrategies} />
                        </Spin>
                    </Col>
                </Row>
                <Row style={pieRowStyle}>
                <Col style={{textAlign: "center"}}>
                            <Spin spinning={isFetching}>
                                <CustomPieChart
                                    title="Study Types"
                                    style={{cursor: "pointer"}}
                                    data={studyTypeData}
                                    chartHeight={this.state.chartHeight}
                                    chartAspectRatio={this.state.chartAspectRatio}
                                    fieldLabel={"[dataset item].study_type"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                    </Col>

                    <Col style={{textAlign: "center"}}>
                            <Spin spinning={isFetching}>
                                <CustomPieChart
                                    title="Experiment Types"    
                                    style={{cursor: "pointer"}}
                                    data={experimentTypeData}
                                    chartHeight={this.state.chartHeight}
                                    chartAspectRatio={this.state.chartAspectRatio}
                                    fieldLabel={"[dataset item].experiment_type"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                    </Col>

                    <Col style={{textAlign: "center"}}>
                            <Spin spinning={isFetching}>
                                <CustomPieChart
                                    title="Molecules Used"    
                                    style={{cursor: "pointer"}}
                                    data={moleculeData}
                                    chartHeight={this.state.chartHeight}
                                    chartAspectRatio={this.state.chartAspectRatio}
                                    fieldLabel={"[dataset item].molecule"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                    </Col>

                    <Col style={{textAlign: "center"}}>
                            <Spin spinning={isFetching}>
                                <CustomPieChart
                                    title="Library Strategies"    
                                    style={{cursor: "pointer"}}
                                    data={libraryStrategyData}
                                    chartHeight={this.state.chartHeight}
                                    chartAspectRatio={this.state.chartAspectRatio}
                                    fieldLabel={"[dataset item].library_strategy"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                    </Col>

                    <Col style={{textAlign: "center"}}>
                            <Spin spinning={isFetching}>
                                <CustomPieChart
                                    title="Library Selections"    
                                    style={{cursor: "pointer"}}
                                    data={librarySelectionData}
                                    chartHeight={this.state.chartHeight}
                                    chartAspectRatio={this.state.chartAspectRatio}
                                    fieldLabel={"[dataset item].library_selection"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                    </Col>
                </Row>
            </Row>
        </>;
    }
}

export default connect(mapStateToProps, actionCreators)(ExperimentsSummary2);


