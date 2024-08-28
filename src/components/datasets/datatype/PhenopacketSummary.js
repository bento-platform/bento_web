import { Col, Divider, Row, Statistic, Typography } from "antd";

import { summaryPropTypesShape } from "@/propTypes";
import PieChart from "@/components/charts/PieChart";

const COMMON_CHART_PROPS = {
  chartHeight: 280,
  dataType: "phenopacket",
  clickable: true,
};

const PhenopacketSummary = ({ summary }) => {
  const individualsBySex = Object.entries(summary.data_type_specific?.individuals?.sex ?? {})
    .filter((e) => e[1] > 0)
    .map(([name, value]) => ({ name, value }));
  const individualsByKaryotype = Object.entries(summary.data_type_specific?.individuals?.karyotypic_sex ?? {})
    .filter((e) => e[1] > 0)
    .map(([name, value]) => ({ name, value }));
  return (
    <>
      <Typography.Title level={4}>Object Counts</Typography.Title>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic title="Phenopackets" value={summary.count} />
        </Col>
        <Col span={8}>
          <Statistic title="Biosamples" value={summary.data_type_specific?.biosamples?.count ?? "N/A"} />
        </Col>
        <Col span={8}>
          <Statistic title="Individuals" value={summary.data_type_specific?.individuals?.count ?? "N/A"} />
        </Col>
      </Row>
      {individualsBySex.length > 0 && individualsByKaryotype.length > 0 ? (
        <>
          <Divider />
          <Typography.Title level={4}>Overview: Individuals</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <PieChart
                data={individualsBySex}
                title="Sex"
                labelKey="[dataset item].subject.sex"
                {...COMMON_CHART_PROPS}
              />
            </Col>
            <Col span={12}>
              <PieChart
                data={individualsByKaryotype}
                title="Karyotypic Sex"
                labelKey="[dataset item].subject.karyotypic_sex"
                {...COMMON_CHART_PROPS}
              />
            </Col>
          </Row>
        </>
      ) : null}
    </>
  );
};

PhenopacketSummary.propTypes = {
  summary: summaryPropTypesShape,
};

export default PhenopacketSummary;
