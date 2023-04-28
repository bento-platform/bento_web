import React from "react";
import { useSelector } from "react-redux";
import { Col, Row, Spin, Statistic, Typography, Icon } from "antd";

const VariantsSummary = ( ) => {

    const fetchingVariantsOverview = useSelector(state => state.explorer.fetchingVariantsOverview);
    const variantsOverviewResults = useSelector(state => state.explorer.variantsOverviewResponse);
    const hasSampleIds =
        variantsOverviewResults?.sampleIDs !== undefined &&
        !variantsOverviewResults?.sampleIDs.hasOwnProperty("error");
    const numVariantFilesFromSampleIds =
        hasSampleIds ?
            Object.values(variantsOverviewResults.sampleIDs) // retrieve list of values from `sampleIDs`
                .reduce((partialSum, a) => partialSum + a, 0) : // assume number of files (1 file == 1 sampleId) by adding them up
            [];

    return (
        <>
            <Typography.Title level={4}>Variants</Typography.Title>
            <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                    <Spin spinning={fetchingVariantsOverview}>
                        <Statistic title="VCF Files" prefix={<Icon type="file" />} value={numVariantFilesFromSampleIds} />
                    </Spin>
                </Col>
            </Row>
        </>
    );
};

export default VariantsSummary;
