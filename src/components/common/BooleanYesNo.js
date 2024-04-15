import React from "react";
import PropTypes from "prop-types";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

const BooleanYesNo = ({ value }) => {
    if (value) {
        return <span style={{ color: "#52c41a" }}><CheckCircleFilled /> Yes</span>;
    } else {
        return <span style={{ color: "#f5222d" }}><CloseCircleFilled /> No</span>;
    }
};

BooleanYesNo.propTypes = {
    value: PropTypes.bool,
};

export default BooleanYesNo;
