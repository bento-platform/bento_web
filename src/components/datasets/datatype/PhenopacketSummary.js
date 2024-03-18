import React from "react";
import { Col, Divider, Row, Statistic, Typography } from "antd";

import PieChart from "@/components/charts/PieChart";

import { summaryPropTypesShape } from "@/propTypes";

const PhenopacketSummary = ({ summary }) => {
    const individualsBySex = Object.entries(summary.data_type_specific?.individuals?.sex ?? {})
        .filter(e => e[1] > 0)
        .map(([name, value]) => ({ name, value }));
    const individualsByKaryotype = Object.entries(summary.data_type_specific?.individuals?.karyotypic_sex ?? {})
        .filter(e => e[1] > 0)
        .map(([name, value]) => ({ name, value }));
    return <>
        <Typography.Title level={4}>Object Counts</Typography.Title>
        <Row gutter={16}>
            <Col span={8}><Statistic title="Phenopackets" value={summary.count} /></Col>
            <Col span={8}>
                <Statistic title="Biosamples" value={summary.data_type_specific?.biosamples?.count ?? "N/A"} /></Col>
            <Col span={8}>
                <Statistic title="Individuals" value={summary.data_type_specific?.individuals?.count ?? "N/A"} /></Col>
        </Row>
        {(individualsBySex.length > 0 && individualsByKaryotype.length > 0) ? (
            <>
                <Divider />
                <Typography.Title level={4}>Overview: Individuals</Typography.Title>
                <Row gutter={16}>
                    <Col span={24}>
                        <PieChart
                            title="Sex"
                            data={individualsBySex}
                            containerWidth="100%"
                            chartHeight={250}
                            dataType="phenopacket"
                            labelKey="[dataset item].subject.sex"
                        />
                    </Col>
                    <Col span={24}>
                        <PieChart
                            title="Karyotypic Sex"
                            data={individualsByKaryotype}
                            containerWidth="100%"
                            chartHeight={250}
                            dataType="phenopacket"
                            labelKey="[dataset item].subject.karyotypic_sex"
                        />
                    </Col>
                </Row>
            </>
        ) : null}
    </>;
};

PhenopacketSummary.propTypes = {
    summary: summaryPropTypesShape,
};

export default PhenopacketSummary;
