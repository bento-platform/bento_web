import React from "react";

import {Col, Icon, Row, Statistic} from "antd";

import {summaryPropTypesShape} from "../../../../propTypes";

const VariantSummary = ({summary}) =>
    <Row gutter={16}>
        <Col span={8}><Statistic title="Variants" value={summary.count} /></Col>
        <Col span={8}><Statistic title="Samples" value={summary.data_type_specific.samples} /></Col>
        {summary.data_type_specific.vcf_files !== undefined ? (
            <Col span={8}><Statistic title="VCF Files"
                                     prefix={<Icon type="file" />}
                                     value={summary.data_type_specific.vcf_files} /></Col>
        ) : null}
    </Row>;

VariantSummary.propTypes = {
    summary: summaryPropTypesShape
};

export default VariantSummary;
