import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Empty } from "antd";
import { BarChart } from "bento-charts";

const TITLE_STYLE = {
    fontStyle: "italic",
    padding: "0",
    marginBottom: "-15px",
};

const transformData = (data) => data.map(({ ageBin, count }) => ({ x: ageBin, y: count }));

const Histogram = ({ title = "Histogram", data = [], chartHeight = 300 }) => {
    const transformedData = useMemo(() => transformData(data), [data]);

    if (!transformedData.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No available data" />;
    }

    return (
        <div style={{ marginBottom: "20px" }}>
            <h2 style={TITLE_STYLE}>{title}</h2>
            <BarChart data={transformedData} height={chartHeight} />
        </div>
    );
};

Histogram.propTypes = {
    title: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            ageBin: PropTypes.string,
            count: PropTypes.number,
        })
    ),
    chartHeight: PropTypes.number,
};

export default Histogram;
