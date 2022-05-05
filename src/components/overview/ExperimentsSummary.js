import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row, Spin, Statistic, Typography } from "antd";
import CustomPieChart from "./CustomPieChart";
import { setAutoQueryPageTransition } from "../../modules/explorer/actions";
import { overviewSummaryPropTypesShape } from "../../propTypes";
import { mapNameValueFields } from "../../utils/mapNameValueFields";

const ExperimentsSummary = ({
    overviewSummary,
    setAutoQueryPageTransition,
    otherThresholdPercentage,
}) => {
    const chartHeight = 300;
    const chartAspectRatio = 1.8;

    const { data, isFetching } = overviewSummary;

    // TODO: most of these have "other" categories, so counts here are ambiguous or simply incorrect
    const numExperiments =
        overviewSummary.data?.data_type_specific?.experiments?.count;
    const numExperimentTypes = Object.keys(
        overviewSummary.data?.data_type_specific?.experiments
            ?.experiment_type || {}
    ).length;
    const numMoleculesUsed = Object.keys(
        overviewSummary.data?.data_type_specific?.experiments?.molecule || {}
    ).length;
    const numLibraryStrategies = Object.keys(
        overviewSummary.data?.data_type_specific?.experiments
            ?.library_strategy || {}
    ).length;

    // extract data in pie chart format
    const experimentTypeData = mapNameValueFields(
        data.data_type_specific?.experiments?.experiment_type,
        otherThresholdPercentage / 100
    );
    const studyTypeData = mapNameValueFields(
        data.data_type_specific?.experiments?.study_type,
        otherThresholdPercentage / 100
    );
    const moleculeData = mapNameValueFields(
        data.data_type_specific?.experiments?.molecule,
        otherThresholdPercentage / 100
    );
    const libraryStrategyData = mapNameValueFields(
        data.data_type_specific?.experiments?.library_strategy,
        otherThresholdPercentage / 100
    );
    const librarySelectionData = mapNameValueFields(
        data.data_type_specific?.experiments?.library_selection,
        otherThresholdPercentage / 100
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
                            <Statistic
                                title="Experiments"
                                value={numExperiments}
                            />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic
                                title="Experiment Types"
                                value={numExperimentTypes}
                            />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic
                                title="Molecules Used"
                                value={numMoleculesUsed}
                            />
                        </Spin>
                    </Col>
                    <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                        <Spin spinning={isFetching}>
                            <Statistic
                                title="Library Strategies"
                                value={numLibraryStrategies}
                            />
                        </Spin>
                    </Col>
                </Row>
                <Row style={pieRowStyle}>
                    <Col style={{ textAlign: "center" }}>
                        <Spin spinning={isFetching}>
                            <CustomPieChart
                                title="Study Types"
                                style={{ cursor: "pointer" }}
                                data={studyTypeData}
                                chartHeight={chartHeight}
                                chartAspectRatio={chartAspectRatio}
                                fieldLabel={"[dataset item].study_type"}
                                setAutoQueryPageTransition={
                                    setAutoQueryPageTransition
                                }
                                autoQueryDataType={autoQueryDataType}
                            />
                        </Spin>
                    </Col>

                    <Col style={{ textAlign: "center" }}>
                        <Spin spinning={isFetching}>
                            <CustomPieChart
                                title="Experiment Types"
                                style={{ cursor: "pointer" }}
                                data={experimentTypeData}
                                chartHeight={chartHeight}
                                chartAspectRatio={chartAspectRatio}
                                fieldLabel={"[dataset item].experiment_type"}
                                setAutoQueryPageTransition={
                                    setAutoQueryPageTransition
                                }
                                autoQueryDataType={autoQueryDataType}
                            />
                        </Spin>
                    </Col>

                    <Col style={{ textAlign: "center" }}>
                        <Spin spinning={isFetching}>
                            <CustomPieChart
                                title="Molecules Used"
                                style={{ cursor: "pointer" }}
                                data={moleculeData}
                                chartHeight={chartHeight}
                                chartAspectRatio={chartAspectRatio}
                                fieldLabel={"[dataset item].molecule"}
                                setAutoQueryPageTransition={
                                    setAutoQueryPageTransition
                                }
                                autoQueryDataType={autoQueryDataType}
                            />
                        </Spin>
                    </Col>

                    <Col style={{ textAlign: "center" }}>
                        <Spin spinning={isFetching}>
                            <CustomPieChart
                                title="Library Strategies"
                                style={{ cursor: "pointer" }}
                                data={libraryStrategyData}
                                chartHeight={chartHeight}
                                chartAspectRatio={chartAspectRatio}
                                fieldLabel={"[dataset item].library_strategy"}
                                setAutoQueryPageTransition={
                                    setAutoQueryPageTransition
                                }
                                autoQueryDataType={autoQueryDataType}
                            />
                        </Spin>
                    </Col>

                    <Col style={{ textAlign: "center" }}>
                        <Spin spinning={isFetching}>
                            <CustomPieChart
                                title="Library Selections"
                                style={{ cursor: "pointer" }}
                                data={librarySelectionData}
                                chartHeight={chartHeight}
                                chartAspectRatio={chartAspectRatio}
                                fieldLabel={"[dataset item].library_selection"}
                                setAutoQueryPageTransition={
                                    setAutoQueryPageTransition
                                }
                                autoQueryDataType={autoQueryDataType}
                            />
                        </Spin>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

ExperimentsSummary.propTypes = {
    overviewSummary: PropTypes.shape({
        isFetching: PropTypes.bool,
        data: overviewSummaryPropTypesShape,
    }).isRequired,
    setAutoQueryPageTransition: PropTypes.func, // temp
    otherThresholdPercentage: PropTypes.number,
};

const mapStateToProps = (state) => ({
    overviewSummary: state.overviewSummary,
    otherThresholdPercentage: state.explorer.otherThresholdPercentage,
});

const actionCreators = {
    setAutoQueryPageTransition,
};

export default connect(mapStateToProps, actionCreators)(ExperimentsSummary);
