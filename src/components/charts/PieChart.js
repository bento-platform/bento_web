import { useMemo } from "react";
import PropTypes from "prop-types";

import { PieChart as BentoPie } from "bento-charts";

import ChartContainer from "./ChartContainer";

const PieChart = ({ title, data = [], chartThreshold, chartHeight = 300, sortData = true }) => {
  const pieChartData = useMemo(() => data.map(({ name, value }) => ({ x: name, y: value })), [data]);
  return (
    <ChartContainer title={title} empty={!Array.isArray(data) && !data.length}>
      <BentoPie data={pieChartData} height={chartHeight} sort={sortData} chartThreshold={chartThreshold} />
    </ChartContainer>
  );
};

PieChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    }),
  ).isRequired,
  chartThreshold: PropTypes.number,
  chartHeight: PropTypes.number,
  dataType: PropTypes.string,
  labelKey: PropTypes.string,
  sortData: PropTypes.bool,
};

export default PieChart;
