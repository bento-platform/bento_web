import React from "react";
import PropTypes from "prop-types";

const VictoryPieWrapSVG = ({ viewBoxStr, children }) => (
    <svg
        viewBox={
            viewBoxStr === undefined || viewBoxStr === ""
                ? "0 0 400 250"
                : viewBoxStr
        }
    >
        {children}
    </svg>
);
VictoryPieWrapSVG.propTypes = {
    viewBoxStr: PropTypes.string,
    children: PropTypes.any,
};

export default VictoryPieWrapSVG;
