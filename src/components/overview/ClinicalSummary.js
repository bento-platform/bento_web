import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Spin, Statistic, Typography } from "antd";
import CustomPieChart from "../charts/CustomPieChart";
import Histogram from "../charts/Histogram";
import { setAutoQueryPageTransition } from "../../modules/explorer/actions";
import { mapNameValueFields } from "../../utils/mapNameValueFields";

const ClinicalSummary = () => {
    const chartHeight = 300;
    const chartAspectRatio = 1.8;

    const dispatch = useDispatch();
    const setAutoQueryPageTransitionFunc = (priorPageUrl, type, field, value) =>
        dispatch(setAutoQueryPageTransition(priorPageUrl, type, field, value));

    const { data, isFetching } = useSelector((state) => state.overviewSummary);
    const otherThresholdPercentage = useSelector(
        (state) => state.explorer.otherThresholdPercentage,
    );

    const statistics = [
        {
            title: "Participants",
            value: data.data_type_specific?.individuals?.count,
        },
        {
            title: "Biosamples",
            value: data.data_type_specific?.biosamples?.count,
        },
        {
            title: "Diseases",
            value: data.data_type_specific?.diseases?.count,
        },
        {
            title: "Phenotypic Features",
            value: data?.data_type_specific?.phenotypic_features?.count,
        },
        {
            title: "Experiments",
            value: data?.data_type_specific?.experiments?.count,
        },
    ];

    const charts = [
        {
            title: "Individuals",
            data: mapNameValueFields(
                data.data_type_specific?.individuals?.sex,
                -1,
            ),
            fieldLabel: "[dataset item].subject.sex",
            type: "PIE",
        },
        {
            title: "Diseases",
            data: mapNameValueFields(
                data.data_type_specific?.diseases?.term,
                otherThresholdPercentage / 100,
            ),
            fieldLabel: "[dataset item].diseases.[item].term.label",
            type: "PIE",
        },
        {
            title: "Ages",
            data: binAges(data.data_type_specific?.individuals?.age),
            type: "HISTOGRAM",
        },
        {
            title: "Biosamples",
            data: mapNameValueFields(
                data.data_type_specific?.biosamples?.sampled_tissue,
                otherThresholdPercentage / 100,
            ),
            fieldLabel: "[dataset item].biosamples.[item].sampled_tissue.label",
            type: "PIE",
        },
        {
            title: "Phenotypic Features",
            data: mapNameValueFields(
                data.data_type_specific?.phenotypic_features?.type,
                otherThresholdPercentage / 100,
            ),
            fieldLabel: "[dataset item].phenotypic_features.[item].type.label",
            type: "PIE",
        },
    ];

    const autoQueryDataType = "phenopacket";

    return (
        <>
            <Row>
                <Typography.Title level={4}>
                    Clinical/Phenotypic Data
                </Typography.Title>
                <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                    {statistics.map((s, i) => (
                        <Col key={i} xl={2} lg={3} md={5} sm={6} xs={10}>
                            <Spin spinning={isFetching}>
                                <Statistic title={s.title} value={s.value} />
                            </Spin>
                        </Col>
                    ))}
                </Row>
                <Row style={{ display: "flex", flexWrap: "wrap" }}>
                    {charts
                        .filter((e) => e.data?.length > 0)
                        .map((c, i) => (
                            <Col key={i} style={{ textAlign: "center" }}>
                                <Spin spinning={isFetching}>
                                    {c.type === "PIE" ? (
                                        <CustomPieChart
                                            title={c.title}
                                            data={c.data}
                                            chartHeight={chartHeight}
                                            chartAspectRatio={chartAspectRatio}
                                            fieldLabel={c.fieldLabel}
                                            setAutoQueryPageTransition={
                                                setAutoQueryPageTransitionFunc
                                            }
                                            autoQueryDataType={
                                                autoQueryDataType
                                            }
                                        />
                                    ) : (
                                        <Histogram
                                            title={c.title}
                                            data={c.data}
                                            chartAspectRatio={chartAspectRatio}
                                            chartHeight={chartHeight}
                                        />
                                    )}
                                </Spin>
                            </Col>
                        ))}
                </Row>
            </Row>
        </>
    );
};

export default ClinicalSummary;

// custom binning function
// input is object: {age1: count1, age2: count2....}
// outputs an array [{bin1: bin1count}, {bin2: bin2count}...]
const binAges = (ages) => {
    if (!ages) return null;

    const ageBinCounts = {
        0: 0,
        10: 0,
        20: 0,
        30: 0,
        40: 0,
        50: 0,
        60: 0,
        70: 0,
        80: 0,
        90: 0,
        100: 0,
        110: 0,
    };

    for (const [age, count] of Object.entries(ages)) {
        const ageBin = 10 * Math.floor(Number(age) / 10);
        ageBinCounts[ageBin] += count;
    }

    // only show ages 110+ if present
    if (!ageBinCounts[110]) {
        delete ageBinCounts[110];
    }

    // return histogram-friendly array
    return Object.keys(ageBinCounts).map((age) => {
        return { ageBin: age, count: ageBinCounts[age] };
    });
};
