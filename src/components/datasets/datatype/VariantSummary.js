import { Col, Row, Statistic } from "antd";

import { EM_DASH } from "@/constants";
import { summaryPropTypesShape } from "@/propTypes";

const VariantSummary = ({ summary }) => (
  <Row gutter={16}>
    <Col span={12}>
      <Statistic title="Variants" value={summary.count} />
    </Col>
    <Col span={12}>
      <Statistic title="Samples" value={summary.data_type_specific?.samples ?? EM_DASH} />
    </Col>
  </Row>
);

VariantSummary.propTypes = {
  summary: summaryPropTypesShape,
};

export default VariantSummary;
