import { CSSProperties, ReactNode, memo } from "react";
import { COLOR_ANTD_RED_6 } from "@/constants";

export type ErrorTextProps = {
  children?: ReactNode;
  style?: CSSProperties;
};

const ErrorText = memo(({ children, style, ...rest }: ErrorTextProps) => (
  <span style={{ color: COLOR_ANTD_RED_6, ...(style ?? {}) }} {...rest}>
    {children}
  </span>
));

export default ErrorText;
