import { type CSSProperties, useMemo } from "react";

import { Popover } from "antd";

import MonospaceText from "@/components/common/MonospaceText";
import { COLOR_ANTD_RED_6, EM_DASH } from "@/constants";

const ExpiryTimestamp = ({ expiry }: { expiry?: string }) => {
    const expiryTs = useMemo(() => expiry ? Date.parse(expiry) : null, [expiry]);
    const currentTs = Date.now();

    const expired = expiryTs && (expiryTs <= currentTs);

    const spanStyle = useMemo(
        (): CSSProperties => expired ? { color: COLOR_ANTD_RED_6 } : {},
        [expiry, expired]);

    if (!expiry) return EM_DASH;

    return (
        <Popover content={<span>UTC timestamp: <MonospaceText>{expiry}</MonospaceText></span>}>
            <span style={spanStyle}>
                {new Date(Date.parse(expiry)).toLocaleString()}{" "}
                {expired ? <em>(EXPIRED)</em> : ""}
            </span>
        </Popover>
    );
};

export default ExpiryTimestamp;
