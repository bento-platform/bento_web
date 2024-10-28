import type { CSSProperties, ReactNode } from "react";

const style: CSSProperties = {
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
};

const ActionContainer = ({ children, ...props }: ActionContainerProps) => (
  <div style={style} {...props}>
    {children}
  </div>
);

export default ActionContainer;
