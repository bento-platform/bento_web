import type { CSSProperties, ReactNode } from "react";

const BASE_STYLE: CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "baseline",
  position: "sticky",
  paddingBottom: 4,
  backgroundColor: "white",
  boxShadow: "0 10px 10px white, 0 -10px 0 white",
  top: 8,
  zIndex: 10,
};

type ActionContainerProps = {
  children: ReactNode;
  style?: CSSProperties;
};

const ActionContainer = ({ children, style, ...props }: ActionContainerProps) => (
  <div style={{ ...BASE_STYLE, ...(style ?? {}) }} {...props}>
    {children}
  </div>
);

export default ActionContainer;
