import React, {useCallback, useMemo} from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { PieChart as BentoPie } from "bento-charts";
import ChartContainer from "./ChartContainer";

const PieChart = ({
    title,
    data = [],
    chartThreshold,
    chartHeight = 300,
    onAutoQueryTransition,
    dataType,
    labelKey,
    sortData = true,
}) => {
    const navigate = useNavigate();

    const handleChartClick = useCallback(
        (pointData) => {
            if (onAutoQueryTransition && pointData.name !== "Other") {
                onAutoQueryTransition(window.location.href, dataType, labelKey, pointData.name);
                navigate("/data/explorer/search");
            }
        },
        [onAutoQueryTransition, dataType, labelKey, navigate],
    );

    const pieChartData = useMemo(() => data.map(({ name, value }) => ({ x: name, y: value })), [data]);
    return (
        <ChartContainer title={title} empty={!Array.isArray(data) && !data.length}>
            <BentoPie
                data={pieChartData}
                height={chartHeight}
                onClick={handleChartClick}
                sort={sortData}
                chartThreshold={chartThreshold}
            />
        </ChartContainer>
    );
};

PieChart.propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
        }),
    ).isRequired,
    chartThreshold: PropTypes.number,
    chartHeight: PropTypes.number,
    onAutoQueryTransition: PropTypes.func,
    dataType: PropTypes.string,
    labelKey: PropTypes.string,
    sortData: PropTypes.bool,
};

export default PieChart;
