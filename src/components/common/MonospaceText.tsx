import { CSSProperties, ReactNode, memo } from "react";

export type MonospaceTextProps = {
  children?: ReactNode;
  style?: CSSProperties;
};

const MonospaceText = memo(({ children, style, ...rest }: MonospaceTextProps) => (
  <span style={{ fontFamily: "monospace", ...(style ?? {}) }} {...rest}>
    {children}
  </span>
));

export default MonospaceText;
