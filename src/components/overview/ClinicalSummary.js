import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Col, Row, Typography } from "antd";
import { getPieChart } from "../../utils/overview";
import StatisticCollection from "./StatisticCollection";
import ChartCollection from "./ChartCollection";

const ClinicalSummary = () => {
    const { data, isFetching } = useSelector((state) => state.overviewSummary);

    const { data_type_specific: dataTypeSpecific } = data ?? {};

    const statistics = useMemo(() => [
        {
            title: "Participants",
            value: dataTypeSpecific?.individuals?.count,
        },
        {
            title: "Biosamples",
            value: dataTypeSpecific?.biosamples?.count,
        },
        {
            title: "Diseases",
            value: dataTypeSpecific?.diseases?.count,
        },
        {
            title: "Phenotypic Features",
            value: dataTypeSpecific?.phenotypic_features?.count,
        },
        {
            title: "Experiments",
            value: dataTypeSpecific?.experiments?.count,
        },
    ], [dataTypeSpecific]);

    const charts = useMemo(() => [
        getPieChart({
            title: "Individuals",
            data: dataTypeSpecific?.individuals?.sex,
            fieldLabel: "[dataset item].subject.sex",
            thresholdFraction: 0,
        }),
        getPieChart({
            title: "Diseases",
            data: dataTypeSpecific?.diseases?.term,
            fieldLabel: "[dataset item].diseases.[item].term.label",
        }),
        {
            title: "Ages",
            data: binAges(dataTypeSpecific?.individuals?.age),
            type: "HISTOGRAM",
        },
        getPieChart({
            title: "Biosamples",
            data: dataTypeSpecific?.biosamples?.sampled_tissue,
            fieldLabel: "[dataset item].biosamples.[item].sampled_tissue.label",
        }),
        getPieChart({
            title: "Phenotypic Features",
            data: dataTypeSpecific?.phenotypic_features?.type,
            fieldLabel: "[dataset item].phenotypic_features.[item].type.label",
        }),
    ], [dataTypeSpecific]);

    return (
        <>
            <Typography.Title level={4}>Clinical/Phenotypic Data</Typography.Title>
            <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                <StatisticCollection statistics={statistics} isFetching={isFetching} />
            </Row>
            <Row>
                <ChartCollection charts={charts} dataType="phenopacket" isFetching={isFetching} />
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
