import React from "react";
import ReactJson from "react18-json-view";
import PropTypes from "prop-types";

const JsonView = ({ src, collapsed }) => (
    <ReactJson
        src={src}
        enableClipboard={false}
        indentWidth={2}
        collapsed={collapsed}
        theme="github"
    />
);

JsonView.defaultProps = {
    collapsed: 1,
};

JsonView.propTypes = {
    src: PropTypes.any,
    collapsed: PropTypes.oneOfType([PropTypes.number, PropTypes.bool, PropTypes.func]),
};

export default JsonView;
