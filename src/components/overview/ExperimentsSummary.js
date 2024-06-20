import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { Row, Typography } from "antd";

import { getPieChart } from "@/utils/overview";

import StatisticCollection from "./StatisticCollection";
import ChartCollection from "./ChartCollection";

const ExperimentsSummary = ({ overviewSummary }) => {
  const { data, isFetching, hasAttempted } = overviewSummary;
  const experimentsSummary = data?.experiment?.data_type_specific?.experiments ?? {};

  // TODO: most of these have "other" categories, so counts here are ambiguous or simply incorrect
  const statistics = useMemo(
    () => [
      { title: "Experiments", value: experimentsSummary.count ?? 0 },
      { title: "Experiment Types", value: Object.keys(experimentsSummary.experiment_type || {}).length },
      { title: "Molecules Used", value: Object.keys(experimentsSummary.molecule || {}).length },
      { title: "Library Strategies", value: Object.keys(experimentsSummary.library_strategy || {}).length },
    ],
    [experimentsSummary],
  );

  const charts = useMemo(
    () => [
      getPieChart({
        title: "Study Types",
        data: experimentsSummary.study_type,
        fieldLabel: "[dataset item].study_type",
      }),
      getPieChart({
        title: "Experiment Types",
        data: experimentsSummary.experiment_type,
        fieldLabel: "[dataset item].experiment_type",
      }),
      getPieChart({
        title: "Molecules Used",
        data: experimentsSummary.molecule,
        fieldLabel: "[dataset item].molecule",
      }),
      getPieChart({
        title: "Library Strategies",
        data: experimentsSummary.library_strategy,
        fieldLabel: "[dataset item].library_strategy",
      }),
      getPieChart({
        title: "Library Selections",
        data: experimentsSummary.library_selection,
        fieldLabel: "[dataset item].library_selection",
      }),
    ],
    [experimentsSummary],
  );

  return (
    <>
      <Typography.Title level={4}>Experiments</Typography.Title>
      <Row style={{ marginBottom: 24 }} gutter={[0, 16]}>
        <StatisticCollection statistics={statistics} isFetching={isFetching || !hasAttempted} />
      </Row>
      <Row>
        <ChartCollection charts={charts} dataType="experiment" isFetching={isFetching || !hasAttempted} />
      </Row>
    </>
  );
};
ExperimentsSummary.propTypes = {
  overviewSummary: PropTypes.shape({
    data: PropTypes.object,
    isFetching: PropTypes.bool,
    hasAttempted: PropTypes.bool,
  }),
};

export default ExperimentsSummary;
