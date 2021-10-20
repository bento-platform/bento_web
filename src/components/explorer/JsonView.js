import React from "react";
import ReactJson from "react-json-view";
import PropTypes from "prop-types";

const background = "white";
const keyText = "#252525";
const valueText = "#595959";
const itemCountText = "#b2b2b2";
const expandIcon = "gray";
// const bentoMenuBlue = "#1890ff"

// partial guide to theme colours:
// 00 background
// 02 vertical indent line
// 04 item count
// 07 keys
// 09 string values
// 0B float values
// 0C array indexes
// 0D expand icon when uncollapsed
// 0E expand icon when collapsed
// 0F int values
// other values unused in our case (all marked "black")

const theme = {
    base00: background,
    base01: "black",
    base02: background,
    base03: "black",
    base04: itemCountText,
    base05: "black",
    base06: "black",
    base07: keyText,
    base08: "black",
    base09: valueText,
    base0A: "black",
    base0B: valueText,
    base0C: keyText,
    base0D: expandIcon,
    base0E: expandIcon,
    base0F: valueText,
};

const JsonView = ({ inputJson }) => {
    return (
    <ReactJson
      src={inputJson}
      displayDataTypes={false}
      displayObjectSize={true}
      enableClipboard={false}
      indentWidth={2}
      name={false}
      collapsed={1}
      quotesOnKeys={false}
      theme={theme}
    />
    );
};

JsonView.propTypes = {
    inputJson: PropTypes.object,
};

export default JsonView;
