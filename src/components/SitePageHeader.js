import React from "react";
import PropTypes from "prop-types";

import { PageHeader } from "antd";

const PAGE_HEADER_STYLE = {
    borderBottom: "1px solid rgb(232, 232, 232)",
    background: "white",
    padding: "12px 24px",
};

const PAGE_HEADER_TITLE_STYLE = {
    fontSize: "1rem",
    lineHeight: "22px",
    margin: "5px 0",
};

const PAGE_HEADER_SUBTITLE_STYLE = {
    lineHeight: "23px",
};

const TAB_BAR_HEADER_STYLING = { borderBottom: "none", paddingBottom: "0" };

const SitePageHeader = ({ title, subTitle, withTabBar, style, ...props }) => (
    <PageHeader
        {...{ title, subTitle, withTabBar, style, ...props }}
        title={<div style={PAGE_HEADER_TITLE_STYLE}>{title || ""}</div>}
        subTitle={
            subTitle ? (
                <span style={PAGE_HEADER_SUBTITLE_STYLE}>{subTitle}</span>
            ) : undefined
        }
        style={{
            ...PAGE_HEADER_STYLE,
            ...(withTabBar ? TAB_BAR_HEADER_STYLING : {}),
            ...(style || {}),
        }}
    />
);

SitePageHeader.propTypes = {
    title: PropTypes.string,
    subTitle: PropTypes.string,
    withTabBar: PropTypes.bool,
    style: PropTypes.object,
};

export default SitePageHeader;
