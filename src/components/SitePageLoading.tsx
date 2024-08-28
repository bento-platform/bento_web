import { Skeleton } from "antd";

import SitePageHeader from "./SitePageHeader";

const SitePageLoading = () => (
  <>
    <SitePageHeader title="&nbsp;" />
    <div style={{ padding: "24px", background: "white" }}>
      <Skeleton title={false} active={true} />
    </div>
  </>
);

export default SitePageLoading;
