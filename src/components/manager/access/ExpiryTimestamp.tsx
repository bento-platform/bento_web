import React from "react";

import { Popover } from "antd";

import MonospaceText from "@/components/common/MonospaceText";
import { EM_DASH } from "@/constants";

const ExpiryTimestamp = ({ expiry }: { expiry?: string }) => {
    if (!expiry) return EM_DASH;
    return (
        <Popover content={<span>UTC timestamp: <MonospaceText>{expiry}</MonospaceText></span>}>
            {new Date(Date.parse(expiry)).toLocaleString()}
        </Popover>
    );
};

export default ExpiryTimestamp;
