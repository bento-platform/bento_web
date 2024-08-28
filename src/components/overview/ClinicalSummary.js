import { useMemo } from "react";
import PropTypes from "prop-types";

import { Row, Typography } from "antd";

import { getPieChart } from "@/utils/overview";

import StatisticCollection from "./StatisticCollection";
import ChartCollection from "./ChartCollection";

const ClinicalSummary = ({ overviewSummary }) => {
  const { data, isFetching, hasAttempted } = overviewSummary;
  const { phenopacket, experiment } = data ?? {};

  const { data_type_specific: phenoSpecific } = phenopacket ?? {};
  const { data_type_specific: expSpecific } = experiment ?? {};

  const statistics = useMemo(
    () => [
      {
        title: "Participants",
        value: phenoSpecific?.individuals?.count,
      },
      {
        title: "Biosamples",
        value: phenoSpecific?.biosamples?.count,
      },
      {
        title: "Diseases",
        value: phenoSpecific?.diseases?.count,
      },
      {
        title: "Phenotypic Features",
        value: phenoSpecific?.phenotypic_features?.count,
      },
      {
        title: "Experiments",
        value: expSpecific?.experiments?.count,
      },
    ],
    [phenoSpecific, expSpecific],
  );

  const charts = useMemo(
    () => [
      getPieChart({
        title: "Individuals",
        data: phenoSpecific?.individuals?.sex,
        fieldLabel: "[dataset item].subject.sex",
        thresholdFraction: 0,
      }),
      getPieChart({
        title: "Diseases",
        data: phenoSpecific?.diseases?.term,
        fieldLabel: "[dataset item].diseases.[item].term.label",
      }),
      {
        title: "Ages",
        data: binAges(phenoSpecific?.individuals?.age),
        type: "HISTOGRAM",
      },
      getPieChart({
        title: "Biosamples",
        data: phenoSpecific?.biosamples?.sampled_tissue,
        fieldLabel: "[dataset item].biosamples.[item].sampled_tissue.label",
      }),
      getPieChart({
        title: "Phenotypic Features",
        data: phenoSpecific?.phenotypic_features?.type,
        fieldLabel: "[dataset item].phenotypic_features.[item].type.label",
      }),
    ],
    [phenoSpecific],
  );

  return (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Clinical/Phenotypic Data
      </Typography.Title>
      <Row style={{ marginBottom: 24 }} gutter={[0, 16]}>
        <StatisticCollection statistics={statistics} isFetching={isFetching || !hasAttempted} />
      </Row>
      <Row>
        <ChartCollection charts={charts} dataType="phenopacket" isFetching={isFetching || !hasAttempted} />
      </Row>
    </>
  );
};
ClinicalSummary.propTypes = {
  overviewSummary: PropTypes.shape({
    data: PropTypes.object,
    isFetching: PropTypes.bool,
    hasAttempted: PropTypes.bool,
  }),
};

export default ClinicalSummary;

// custom binning function
// input is object: {age1: count1, age2: count2....}
// outputs an array [{bin1: bin1count}, {bin2: bin2count}...]
const binAges = (ages) => {
  if (!ages) return null;

  const ageBinCounts = {
    0: 0,
    10: 0,
    20: 0,
    30: 0,
    40: 0,
    50: 0,
    60: 0,
    70: 0,
    80: 0,
    90: 0,
    100: 0,
    110: 0,
  };

  for (const [age, count] of Object.entries(ages)) {
    const ageBin = 10 * Math.floor(Number(age) / 10);
    ageBinCounts[ageBin] += count;
  }

  // only show ages 110+ if present
  if (!ageBinCounts[110]) {
    delete ageBinCounts[110];
  }

  // return histogram-friendly array
  return Object.keys(ageBinCounts).map((age) => {
    return { ageBin: age, count: ageBinCounts[age] };
  });
};
