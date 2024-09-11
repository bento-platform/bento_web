import { BiDna } from "react-icons/bi";
import { Col, Row, Spin, Statistic, Typography } from "antd";
import { useGohanVariantsOverview } from "@/modules/explorer/hooks";

const VariantsSummary = () => {
  const { isFetching: fetchingVariantsOverview, data: variantsOverviewResults } = useGohanVariantsOverview();
  const hasSampleIds =
    variantsOverviewResults?.sampleIDs !== undefined && !variantsOverviewResults?.sampleIDs.hasOwnProperty("error");
  // retrieve list of values from `sampleIDs`
  //   assumes (1 sampleId == 1 file)
  const numVarFilesFromSampleIds = hasSampleIds ? Object.keys(variantsOverviewResults.sampleIDs).length : 0;

  return (
    <>
      <Typography.Title level={4}>Variants</Typography.Title>
      <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
        <Col xl={2} lg={3} md={4} sm={5} xs={6}>
          <Spin spinning={fetchingVariantsOverview}>
            <Statistic title="Samples" prefix={<BiDna />} value={numVarFilesFromSampleIds} />
          </Spin>
        </Col>
      </Row>
    </>
  );
};

export default VariantsSummary;
