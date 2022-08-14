import React from "react";
import { useSelector } from "react-redux";
import { Col, Row, Spin, Statistic, Typography, Icon } from "antd";

const VariantsSummary = ( ) => {

    const fetchingTableSummaries = useSelector(state => state.tableSummaries?.isFetching);
    const numVCFs =
        useSelector((state) => state.overviewSummary.data?.data_type_specific?.experiment_results.file_format.VCF) || 0;

    return (
        <>
            <Typography.Title level={4}>Variants</Typography.Title>
            <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                    <Spin spinning={fetchingTableSummaries}>
                        <Statistic title="VCF Files" prefix={<Icon type="file" />} value={numVCFs} />
                    </Spin>
                </Col>
            </Row>
        </>
    );
};

export default VariantsSummary;
