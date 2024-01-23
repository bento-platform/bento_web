import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Typography } from "antd";
import { setAutoQueryPageTransition } from "../../modules/explorer/actions";
import { overviewSummaryPropTypesShape } from "../../propTypes";
import { getPieChart } from "../../utils/overview";
import StatisticCollection from "./StatisticCollection";
import ChartCollection from "./ChartCollection";

const mapStateToProps = (state) => ({
    overviewSummary: state.overviewSummary,
    otherThresholdPercentage: state.explorer.otherThresholdPercentage,
});

const actionCreators = {
    setAutoQueryPageTransition,
};

class ExperimentsSummary extends Component {
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
            chartLabelPaddingTop: 3,
            chartLabelPaddingLeft: 3,
        };
    }

    render() {
        const { overviewSummary } = this.props;
        const { data, isFetching } = overviewSummary;
        const experimentsSummary = data?.data_type_specific?.experiments ?? {};

        // TODO: most of these have "other" categories, so counts here are ambiguous or simply incorrect
        const statistics = [
            { title: "Experiments", value: experimentsSummary.count ?? 0 },
            { title: "Experiment Types", value: Object.keys(experimentsSummary.experiment_type || {}).length },
            { title: "Molecules Used", value: Object.keys(experimentsSummary.molecule || {}).length },
            { title: "Library Strategies", value: Object.keys(experimentsSummary.library_strategy || {}).length },
        ];

        const charts = [
            getPieChart({
                title: "Study Types",
                data: experimentsSummary.experiment_type,
                fieldLabel: "[dataset item].study_type",
            }),
            getPieChart({
                title: "Experiment Types",
                data: experimentsSummary.experiment_type,
                fieldLabel: "[dataset item].experiment_type",
            }),
            getPieChart({
                title: "Molecules Used",
                data: experimentsSummary.molecule,
                fieldLabel: "[dataset item].molecule",
            }),
            getPieChart({
                title: "Library Strategies",
                data: experimentsSummary.library_strategy,
                fieldLabel: "[dataset item].library_strategy",
            }),
            getPieChart({
                title: "Library Selections",
                data: experimentsSummary.library_selection,
                fieldLabel: "[dataset item].library_selection",
            }),
        ];

        return (
            <>
                <Row>
                    <Typography.Title level={4}>Experiments</Typography.Title>
                    <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                        <StatisticCollection statistics={statistics} isFetching={isFetching} />
                    </Row>
                    <ChartCollection charts={charts} dataType="experiment" isFetching={isFetching} />
                </Row>
            </>
        );
    }
}

export default connect(mapStateToProps, actionCreators)(ExperimentsSummary);
