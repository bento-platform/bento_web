import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { PieChart } from "bento-charts";

import { Empty } from "antd";

const titleStyle = {
    fontStyle: "italic",
    padding: "0",
    marginBottom: "-15px",
};

const CustomPieChart = ({
    title,
    data,
    chartHeight,
    setAutoQueryPageTransition,
    autoQueryDataType,
    fieldLabel,
    sort = true,
}) => {
    const history = useHistory();

    const onClick = (data) => {
        if (!setAutoQueryPageTransition || data.skipAutoquery) {
            return;
        }
        console.log("data", data);
        setAutoQueryPageTransition(window.location.href, autoQueryDataType, fieldLabel, data.name);

        // Navigate to Explorer
        history.push("/data/explorer/search");
    };

    if (!data || data.length === 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />;
    }

    return (
        <>
            <div
                style={{
                    marginBottom: "20px",
                }}
            >
                <h2 style={titleStyle}>{title}</h2>
                <PieChart
                    data={data.map(({ name, value }) => ({ x: name, y: value }))}
                    height={chartHeight}
                    onClick={onClick}
                    sort={sort}
                />
            </div>
        </>
    );
};

CustomPieChart.propTypes = {
    title: PropTypes.string,
    data: PropTypes.array,
    chartHeight: PropTypes.number,
    setAutoQueryPageTransition: PropTypes.func,
    autoQueryDataType: PropTypes.string,
    sort: PropTypes.bool,
    fieldLabel: PropTypes.string,
};

export default CustomPieChart;
