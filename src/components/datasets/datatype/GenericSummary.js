import React from "react";

import {Col, Row, Statistic} from "antd";
import { summaryPropTypesShape } from "../../../propTypes";


const GenericSummary = ({summary}) => summary
    ? <Row gutter={16}><Col span={24}><Statistic title="Count" value={summary.count} /></Col></Row>
    : "No summary available";

GenericSummary.propTypes = {
    summary: summaryPropTypesShape,
};

export default GenericSummary;
