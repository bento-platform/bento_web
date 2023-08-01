import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Empty } from "antd";
import { BarChart } from "bento-charts";
import ChartContainer from "./ChartContainer";

const transformData = (data) =>
    data.map(({ ageBin, count }) => ({ x: ageBin, y: count }));

const Histogram = ({
    title = "Histogram",
    data = [],
    chartHeight = 300,
}) => {

    if (!data || !data.length) {
        return (
            <ChartContainer title={title}>
                <div style={{ height: chartHeight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No available data" />
                </div>
            </ChartContainer>
        );
    }

    const transformedData = useMemo(() => transformData(data), [data]);

    return (
        <ChartContainer title={title}>
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
