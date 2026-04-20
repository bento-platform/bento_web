import { Col, Row, Statistic, Typography } from "antd";

import { summaryPropTypesShape } from "@/propTypes";

const PhenopacketSummary = ({ summary }) => {
  return (
    <>
      <Typography.Title level={4}>Object Counts</Typography.Title>
      <Row gutter={16}>
        <Col span={24}>
          <Statistic title="Phenopackets" value={summary.count} />
        </Col>
      </Row>
    </>
  );
};

PhenopacketSummary.propTypes = {
  summary: summaryPropTypesShape,
};

export default PhenopacketSummary;
