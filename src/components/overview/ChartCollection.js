import React from "react";
import { useDispatch } from "react-redux";
import { Col, Row, Spin } from "antd";
import PieChart from "../charts/PieChart";
import Histogram from "../charts/Histogram";
import { setAutoQueryPageTransition } from "../../modules/explorer/actions";

const CHART_HEIGHT = 300;

const ChartCollection = ({ charts, dataType, isFetching }) => {
    const dispatch = useDispatch();

    const setAutoQueryPageTransitionFunc = (priorPageUrl, type, field, value) =>
        dispatch(setAutoQueryPageTransition(priorPageUrl, type, field, value));

    return (
        <Row style={{ display: "flex", flexWrap: "wrap" }}>
            {charts
                .map((c, i) => (
                    <Col key={i} style={{ textAlign: "center" }}>
                        <Spin spinning={isFetching}>
                            {c.type === "PIE" ? (
                                <PieChart
                                    title={c.title}
                                    data={c.data}
                                    chartHeight={CHART_HEIGHT}
                                    chartThreshold={c.thresholdFraction}
                                    labelKey={c.fieldLabel}
                                    onAutoQueryTransition={setAutoQueryPageTransitionFunc}
                                    dataType={dataType}
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
};

export default ChartCollection;
