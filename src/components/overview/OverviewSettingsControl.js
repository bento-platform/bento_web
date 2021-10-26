import React, { useState } from "react";
import { Col, InputNumber, Row, Slider } from "antd";
import PropTypes from "prop-types";


const OverviewSettingsControl = ({ otherThresholdPercentage, setOtherThresholdPercentage }) => {
    const [inputValue, setInputValue] = useState(otherThresholdPercentage);

    const handleChange = (newValue) => {
        setInputValue(newValue);
        setOtherThresholdPercentage(newValue);
    };

    const toolTipFormatter = (value) => `${value}%`;

    return (
    <Row>
      <Col span={6}>
        <Slider
          min={0}
          max={25}
          onChange={handleChange}
          value={typeof inputValue === "number" ? inputValue : 0}
          step={0.1}
          tipFormatter={toolTipFormatter}
        />
      </Col>
      <Col span={6}>
        <InputNumber
          min={0}
          max={100}
          style={{ margin: "0 16px" }}
          step={0.1}
          value={typeof inputValue === "number" ? inputValue : 0}
          extra={"Threshold for grouping categories into other"}
          onChange={handleChange}
        />
      </Col>
      Percentage threshold to group categories into &quot;Other&quot;
    </Row>
    );
};

OverviewSettingsControl.propTypes = {
    otherThresholdPercentage: PropTypes.number,
    setOtherThresholdPercentage: PropTypes.func
};

export default OverviewSettingsControl;
