import type { ReactNode } from "react";
import { Empty } from "antd";
import PropTypes from "prop-types";

const TITLE_STYLE = {
  fontStyle: "italic",
  fontWeight: "500",
  margin: "0 0 10px 0",
};

type ChartContainerProps = {
  title: string;
  children: ReactNode;
  empty?: boolean;
};

const ChartContainer = ({ title, children, empty }: ChartContainerProps) => (
  <div style={{ marginBottom: "20px", width: "100%" }}>
    <h2 style={TITLE_STYLE}>{title}</h2>
    {empty ? <NoDataComponent height={300} /> : children}
  </div>
);

type NoDataComponentProps = {
  height: number;
};

const NoDataComponent = ({ height }: NoDataComponentProps) => (
  <div
    style={{
      height: height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No available data" />
  </div>
);

NoDataComponent.propTypes = {
  height: PropTypes.number.isRequired,
};

export default ChartContainer;
