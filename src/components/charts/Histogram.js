import React from "react";
import PropTypes from "prop-types";
import { Empty } from "antd";
import { BarChart } from "bento-charts";

const titleStyle = {
    fontStyle: "italic",
    padding: "0",
    marginBottom: "-15px",
};
const titleHeaderHeight = 31;


const Histogram = ({ title, data, chartHeight, chartAspectRatio }) => {
    data = data.map(({ ageBin, count }) => ({ x: ageBin, y: count }));
    return (
        <div style={{ marginBottom: "20px" }}>
            <h2 style={titleStyle}>{title}</h2>
            {data.length !== 0 ? (
                <BarChart data={data} height={chartHeight} />
            ) : (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: `${chartHeight - titleHeaderHeight}px`,
                        width: `${(chartHeight - titleHeaderHeight) * chartAspectRatio}px`,
                    }}
                >
                    <Empty />
                </div>
            )}
        </div>
    );
};

Histogram.propTypes = {
    title: PropTypes.string,
    data: PropTypes.array,
    chartHeight: PropTypes.number,
    chartAspectRatio: PropTypes.number,
};

export default Histogram;
