import React from "react";
import { useSelector } from "react-redux";
import { Col, Row, Spin, Statistic, Typography, Icon } from "antd";

const VariantsSummary = ( ) => {

    const fetchingVariantsOverview = useSelector(state => state.explorer?.fetchingVariantsOverview);
    const variantsOverviewResults = useSelector((state) => state.explorer.variantsOverviewResponse);
    const hasAssemblyIds =
        variantsOverviewResults?.assemblyIDs !== undefined &&
        !variantsOverviewResults?.assemblyIDs.hasOwnProperty("error");
    const numVariantsFromAssemblyIds = 
        hasAssemblyIds ? 
        Object.values(variantsOverviewResults?.assemblyIDs) // retrieve list of values from `assemblyIds`
            .reduce((partialSum, a) => partialSum + a, 0) : // get all values and add them up 
        [];
    
    return (
        <>
            <Typography.Title level={4}>Variants</Typography.Title>
            <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                    <Spin spinning={fetchingVariantsOverview}>
                        <Statistic title="VCF Files" prefix={<Icon type="file" />} value={numVariantsFromAssemblyIds} />
                    </Spin>
                </Col>
            </Row>
        </>
    );
};

export default VariantsSummary;
