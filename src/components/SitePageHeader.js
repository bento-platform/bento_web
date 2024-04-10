import React from "react";
import PropTypes from "prop-types";

import { PageHeader } from "@ant-design/pro-components";

const styles = {
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

const SitePageHeader = React.memo(({ title, subTitle, withTabBar, style, ...props }) => (
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

SitePageHeader.propTypes = {
    title: PropTypes.string,
    subTitle: PropTypes.string,
    withTabBar: PropTypes.bool,
    style: PropTypes.object,
};

export default SitePageHeader;
