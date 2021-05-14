import React, {Component} from "react";
import PropTypes from "prop-types";

import {PageHeader} from "antd";

const PAGE_HEADER_STYLE = {
    borderBottom: "1px solid rgb(232, 232, 232)",
    background: "white",
    padding: "12px 24px"
};

const PAGE_HEADER_TITLE_STYLE = {
    fontSize: "1rem",
    lineHeight: "22px",
    margin: "5px 0"
};

const PAGE_HEADER_SUBTITLE_STYLE = {
    lineHeight: "23px"
};

const TAB_BAR_HEADER_STYLING = {borderBottom: "none", paddingBottom: "0"};

class SitePageHeader extends Component {
    render() {
        return <PageHeader {...this.props}
                           title={<div style={PAGE_HEADER_TITLE_STYLE}>{this.props.title || ""}</div>}
                           subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>{this.props.subTitle || ""}</span>}
                           style={{
                               ...PAGE_HEADER_STYLE,
                               ...(this.props.withTabBar ? TAB_BAR_HEADER_STYLING : {}),
                               ...(this.props.style || {}),
                           }} />;
    }
}

SitePageHeader.propTypes = {
    title: PropTypes.string,
    subTitle: PropTypes.string,
    withTabBar: PropTypes.bool,
    style: PropTypes.object,
};

export default SitePageHeader;
