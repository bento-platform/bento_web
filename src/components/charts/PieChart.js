import React, {useCallback, useMemo} from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { PieChart as BentoPie } from "bento-charts";
import ChartContainer from "./ChartContainer";
import { setAutoQueryPageTransition } from "@/modules/explorer/actions";
import { useDispatch } from "react-redux";

const PieChart = ({
    title,
    data = [],
    chartThreshold,
    chartHeight = 300,
    dataType,
    labelKey,
    clickable = false,
    sortData = true,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onAutoQueryTransition = useCallback((priorPageUrl, type, field, value) =>
        dispatch(setAutoQueryPageTransition(priorPageUrl, type, field, value)), [dispatch]);

    const handleChartClick = useCallback(
        (pointData) => {
            if (dataType && labelKey && pointData.name !== "Other") {
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
                onClick={clickable ? handleChartClick : undefined}
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
    dataType: PropTypes.string,
    labelKey: PropTypes.string,
    clickable: PropTypes.bool,
    sortData: PropTypes.bool,
};

export default PieChart;
