import React from "react";
import SitePageHeader from "./SitePageHeader";

import { Skeleton } from "antd";

const SitePageLoading = () => (
  <>
    <SitePageHeader title="&nbsp;" />
    <div style={{ padding: "24px", background: "white" }}>
      <Skeleton title={false} active={true} />
    </div>
  </>
);

export default SitePageLoading;
