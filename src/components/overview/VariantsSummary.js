import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row, Spin, Statistic, Typography, Icon } from "antd";

const VariantsSummary = ({ tableSummaries }) => {
    const fetchingTableSummaries = tableSummaries?.isFetching;
    const variantTableSummaries =
        tableSummaries?.summariesByServiceArtifactAndTableID?.variant;

    let numVCFs = 0;
    Object.values(variantTableSummaries || []).forEach((s) => {
        numVCFs += s.data_type_specific.vcf_files;
    });

    return (
        <>
            <Typography.Title level={4}>Variants</Typography.Title>
            <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                    <Spin spinning={fetchingTableSummaries}>
                        <Statistic
                            title="VCF Files"
                            prefix={<Icon type="file" />}
                            value={numVCFs}
                        />
                    </Spin>
                </Col>
            </Row>
        </>
    );
};

VariantsSummary.propTypes = {
    tableSummaries: PropTypes.shape({
        isFetching: PropTypes.bool,
        summariesByServiceArtifactAndTableID: PropTypes.object,
    }),
};

const mapStateToProps = (state) => ({
    tableSummaries: state.tableSummaries,
});

const actionCreators = {};

export default connect(mapStateToProps, actionCreators)(VariantsSummary);
