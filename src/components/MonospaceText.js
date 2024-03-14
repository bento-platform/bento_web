import React, { memo } from "react";
import PropTypes from "prop-types";

const MonospaceText = memo(({ children, style }) => (
    <span style={{ fontFamily: "monospace", ...(style ?? {}) }}>{children}</span>
));
MonospaceText.propTypes = {
    children: PropTypes.node,
    style: PropTypes.object,
};

export default MonospaceText;
