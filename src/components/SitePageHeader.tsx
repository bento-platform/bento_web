import { type CSSProperties, memo } from "react";

import { PageHeader, type PageHeaderProps } from "@ant-design/pro-components";

const styles: Record<string, CSSProperties> = {
  pageHeader: {
    borderBottom: "1px solid rgb(232, 232, 232)",
    background: "white",
    padding: "12px 24px",
  },
  pageHeaderTitle: {
    fontSize: "1rem",
    lineHeight: "22px",
    margin: "5px 0",
  },
  pageHeaderSubtitle: {
    lineHeight: "23px",
  },
  tabBarHeader: {
    borderBottom: "none",
    paddingBottom: "0",
  },
};

type SitePageHeaderProps = PageHeaderProps & {
  title?: string;
  subTitle?: string;
  withTabBar?: boolean;
};

const SitePageHeader = memo(({ title, subTitle, withTabBar, style, ...props }: SitePageHeaderProps) => (
  <PageHeader
    {...props}
    title={<div style={styles.pageHeaderTitle}>{title || ""}</div>}
    subTitle={subTitle ? <span style={styles.pageHeaderSubtitle}>{subTitle}</span> : undefined}
    style={{
      ...styles.pageHeader,
      ...(withTabBar ? styles.tabBarHeader : {}),
      ...(style ?? {}),
    }}
  />
));

export default SitePageHeader;
