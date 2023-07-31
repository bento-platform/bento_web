import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { PieChart } from "bento-charts";
import { Empty } from "antd";
import ChartContainer from "./ChartContainer";

const CustomPieChart = ({
    title,
    data = [],
    chartHeight = 300,
    onAutoQueryTransition,
    dataType,
    labelKey,
    sortData = true,
}) => {
    const history = useHistory();

    const handleChartClick = useCallback(
        (pointData) => {
            if (!onAutoQueryTransition || pointData.skipAutoquery) return;

            onAutoQueryTransition(window.location.href, dataType, labelKey, pointData.name);
            history.push("/data/explorer/search");
        },
        [onAutoQueryTransition, dataType, labelKey, history]
    );

    if (!data.length) {
        return (
            <ChartContainer title={title}>
                <div style={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No available data" />
                </div>
            </ChartContainer>
        );
    }

    const pieChartData = data.map(({ name, value }) => ({ x: name, y: value }));

    return (
        <ChartContainer title={title}>
            <PieChart data={pieChartData} height={chartHeight} onClick={handleChartClick} sort={sortData} />
        </ChartContainer>
    );
};

CustomPieChart.propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
        })
    ).isRequired,
    chartHeight: PropTypes.number,
    onAutoQueryTransition: PropTypes.func,
    dataType: PropTypes.string,
    labelKey: PropTypes.string,
    sortData: PropTypes.bool,
};

export default CustomPieChart;
