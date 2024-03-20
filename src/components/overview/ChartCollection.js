import React from "react";
import PropTypes from "prop-types";

import { Col, Row, Spin } from "antd";
import PieChart from "../charts/PieChart";
import Histogram from "../charts/Histogram";

const CHART_HEIGHT = 260;

const ChartCollection = ({ charts, dataType, isFetching }) => (
    <Row style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
        {charts
            .map((c, i) => (
                <Col key={i} style={{ textAlign: "center", width: 420 }}>
                    <Spin spinning={isFetching}>
                        {c.type === "PIE" ? (
                            <PieChart
                                title={c.title}
                                data={c.data}
                                chartHeight={CHART_HEIGHT}
                                chartThreshold={c.thresholdFraction}
                                labelKey={c.fieldLabel}
                                dataType={dataType}
                                clickable={true}
                            />
                        ) : (
                            <Histogram
                                title={c.title}
                                data={c.data}
                                chartHeight={CHART_HEIGHT}
                            />
                        )}
                    </Spin>
                </Col>
            ))}
    </Row>
);
ChartCollection.propTypes = {
    charts: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, value: PropTypes.number })),
        fieldLabel: PropTypes.string,
        thresholdFraction: PropTypes.number,
    })),
    dataType: PropTypes.string.isRequired,
    isFetching: PropTypes.bool,
};

export default ChartCollection;
