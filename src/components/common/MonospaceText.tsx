import { CSSProperties, ReactNode, memo } from "react";

export type MonospaceTextProps = {
    children?: ReactNode;
    style?: CSSProperties;
    [x: string]: any;
};

const MonospaceText = memo(({ children, style, ...props }: MonospaceTextProps) => (
    <span style={{ fontFamily: "monospace", ...(style ?? {}) }} {...props}>{children}</span>
));

export default MonospaceText;
