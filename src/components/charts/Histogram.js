import { useMemo } from "react";
import PropTypes from "prop-types";
import { Histogram as BentoHistogram } from "bento-charts";
import ChartContainer from "./ChartContainer";

const transformAgeData = (data) => data && data.map(({ ageBin, count }) => ({ x: ageBin, y: count }));

const Histogram = ({ title = "Histogram", data = [], chartHeight = 300, unit = "" }) => {
  const transformedData = useMemo(() => transformAgeData(data), [data]);

  return (
    <ChartContainer title={title} empty={!Array.isArray(data) || !data.length}>
      <BentoHistogram data={transformedData} height={chartHeight} removeEmpty={false} units={unit} />
    </ChartContainer>
  );
};

Histogram.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      ageBin: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ),
  chartHeight: PropTypes.number,
  unit: PropTypes.string,
};

export default Histogram;
