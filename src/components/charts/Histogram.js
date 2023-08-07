import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { BarChart } from "bento-charts";
import ChartContainer from "./ChartContainer";

const transformData = (data) => data && data.map(({ ageBin, count }) => ({ x: ageBin, y: count }));

const Histogram = ({ title = "Histogram", data = [], chartHeight = 300 }) => {
    const transformedData = useMemo(() => transformData(data), [data]);

    return (
        <ChartContainer title={title} empty={!Array.isArray(data) || !data.length}>
            <BarChart data={transformedData} height={chartHeight} units="" />
        </ChartContainer>
    );
};

Histogram.propTypes = {
    title: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            ageBin: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
        }),
    ),
    chartHeight: PropTypes.number,
};

export default Histogram;
