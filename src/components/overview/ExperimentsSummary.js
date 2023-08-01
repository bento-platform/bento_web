import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row, Spin, Statistic, Typography } from "antd";
import PieChart from "../charts/PieChart";
import { setAutoQueryPageTransition } from "../../modules/explorer/actions";
import { overviewSummaryPropTypesShape } from "../../propTypes";
import { mapNameValueFields } from "../../utils/mapNameValueFields";

const mapStateToProps = (state) => ({
    overviewSummary: state.overviewSummary,
    otherThresholdPercentage: state.explorer.otherThresholdPercentage,
});

const actionCreators = {
    setAutoQueryPageTransition,
};

class ExperimentsSummary2 extends Component {
    static propTypes = {
        overviewSummary: PropTypes.shape({
            isFetching: PropTypes.bool,
            data: overviewSummaryPropTypesShape,
        }).isRequired,
        setAutoQueryPageTransition: PropTypes.func, // temp
        otherThresholdPercentage: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            chartPadding: "1rem",
            chartHeight: 300,
            chartLabelPaddingTop: 3,
            chartLabelPaddingLeft: 3,
        };
    }

    render() {
        const { overviewSummary, otherThresholdPercentage } = this.props;
        const { data, isFetching } = overviewSummary;

        // TODO: most of these have "other" categories, so counts here are ambiguous or simply incorrect
        const numExperiments = overviewSummary.data?.data_type_specific?.experiments?.count;
        const numExperimentTypes = Object.keys(
            overviewSummary.data?.data_type_specific?.experiments?.experiment_type || {},
        ).length;
        const numMoleculesUsed = Object.keys(
            overviewSummary.data?.data_type_specific?.experiments?.molecule || {},
        ).length;
        const numLibraryStrategies = Object.keys(
            overviewSummary.data?.data_type_specific?.experiments?.library_strategy || {},
        ).length;

        // extract data in pie chart format
        const experimentTypeData = mapNameValueFields(
            data.data_type_specific?.experiments?.experiment_type,
            otherThresholdPercentage / 100,
        );
        const studyTypeData = mapNameValueFields(
            data.data_type_specific?.experiments?.study_type,
            otherThresholdPercentage / 100,
        );
        const moleculeData = mapNameValueFields(
            data.data_type_specific?.experiments?.molecule,
            otherThresholdPercentage / 100,
        );
        const libraryStrategyData = mapNameValueFields(
            data.data_type_specific?.experiments?.library_strategy,
            otherThresholdPercentage / 100,
        );
        const librarySelectionData = mapNameValueFields(
            data.data_type_specific?.experiments?.library_selection,
            otherThresholdPercentage / 100,
        );
        const autoQueryDataType = "experiment";

        const pieRowStyle = { display: "flex", flexWrap: "wrap" };

        return (
            <>
                <Row>
                    <Typography.Title level={4}>Experiments</Typography.Title>
                    <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                        <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                            <Spin spinning={isFetching}>
                                <Statistic title="Experiments" value={numExperiments} />
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
                        <Col style={{ textAlign: "center" }}>
                            <Spin spinning={isFetching}>
                                <PieChart
                                    title="Study Types"
                                    style={{ cursor: "pointer" }}
                                    data={studyTypeData}
                                    chartHeight={this.state.chartHeight}
                                    chartAspectRatio={this.state.chartAspectRatio}
                                    labelKey={"[dataset item].study_type"}
                                    onAutoQueryTransition={this.props.setAutoQueryPageTransition}
                                    dataType={autoQueryDataType}
                                />
                            </Spin>
                        </Col>

                        <Col style={{ textAlign: "center" }}>
                            <Spin spinning={isFetching}>
                                <PieChart
                                    title="Experiment Types"
                                    style={{ cursor: "pointer" }}
                                    data={experimentTypeData}
                                    chartHeight={this.state.chartHeight}
                                    labelKey={"[dataset item].experiment_type"}
                                    onAutoQueryTransition={this.props.setAutoQueryPageTransition}
                                    dataType={autoQueryDataType}
                                />
                            </Spin>
                        </Col>

                        <Col style={{ textAlign: "center" }}>
                            <Spin spinning={isFetching}>
                                <PieChart
                                    title="Molecules Used"
                                    style={{ cursor: "pointer" }}
                                    data={moleculeData}
                                    chartHeight={this.state.chartHeight}
                                    labelKey={"[dataset item].molecule"}
                                    onAutoQueryTransition={this.props.setAutoQueryPageTransition}
                                    dataType={autoQueryDataType}
                                />
                            </Spin>
                        </Col>

                        <Col style={{ textAlign: "center" }}>
                            <Spin spinning={isFetching}>
                                <PieChart
                                    title="Library Strategies"
                                    style={{ cursor: "pointer" }}
                                    data={libraryStrategyData}
                                    chartHeight={this.state.chartHeight}
                                    labelKey={"[dataset item].library_strategy"}
                                    onAutoQueryTransition={this.props.setAutoQueryPageTransition}
                                    dataType={autoQueryDataType}
                                />
                            </Spin>
                        </Col>

                        <Col style={{ textAlign: "center" }}>
                            <Spin spinning={isFetching}>
                                <PieChart
                                    title="Library Selections"
                                    style={{ cursor: "pointer" }}
                                    data={librarySelectionData}
                                    chartHeight={this.state.chartHeight}
                                    labelKey={"[dataset item].library_selection"}
                                    onAutoQueryTransition={this.props.setAutoQueryPageTransition}
                                    dataType={autoQueryDataType}
                                />
                            </Spin>
                        </Col>
                    </Row>
                </Row>
            </>
        );
    }
}

export default connect(mapStateToProps, actionCreators)(ExperimentsSummary2);
