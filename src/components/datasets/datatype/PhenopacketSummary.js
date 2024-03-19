import React from "react";
import { Col, Divider, Row, Statistic, Typography } from "antd";

import { summaryPropTypesShape } from "@/propTypes";

const PhenopacketSummary = ({ summary }) => {
    const individualsBySex = Object.entries(summary.data_type_specific?.individuals?.sex ?? {})
        .filter(e => e[1] > 0)
        .map(([x, y]) => ({ x, y }));
    const individualsByKaryotype = Object.entries(summary.data_type_specific?.individuals?.karyotypic_sex ?? {})
        .filter(e => e[1] > 0)
        .map(([x, y]) => ({ x, y }));
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
                    <Col span={12}>
                        {/*<VictoryPieWrapSVG>*/}
                        {/*    <VictoryPie data={individualsBySex} {...VICTORY_PIE_PROPS} />*/}
                        {/*    <VictoryLabel text="SEX" {...VICTORY_PIE_LABEL_PROPS} />*/}
                        {/*</VictoryPieWrapSVG>*/}
                    </Col>
                    <Col span={12}>
                        {/*<VictoryPieWrapSVG>*/}
                        {/*    <VictoryPie data={individualsByKaryotype} {...VICTORY_PIE_PROPS} />*/}
                        {/*    <VictoryLabel text="KARYOTYPE" {...VICTORY_PIE_LABEL_PROPS} />*/}
                        {/*</VictoryPieWrapSVG>*/}
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
