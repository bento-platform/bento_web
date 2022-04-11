import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, InputNumber, Row, Slider, Modal } from "antd";
import PropTypes from "prop-types";
import { setOtherThresholdPercentage } from "../../modules/explorer/actions";
import { DEFAULT_OTHER_THRESHOLD_PERCENTAGE } from "../../constants";

const OverviewSettingsControl = ({ modalVisible, toggleModalVisibility }) => {
    const otherThresholdPercentage = useSelector((state) => state.explorer.otherThresholdPercentage);
    const [inputValue, setInputValue] = useState(
        otherThresholdPercentage ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE
    );

  //preserve earlier setting in case user cancels
    const [previousThreshold, setPreviousThreshold] = useState(
        otherThresholdPercentage ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE
    );
    const dispatch = useDispatch();

    const handleChange = (newValue) => {
        setInputValue(newValue);
        setOtherThresholdPercentageInStore(newValue);
    };

    const handleEnter = (e) => {
        e.preventDefault();
        setValueAndCloseModal();
    };

    const toolTipFormatter = (value) => `${value}%`;

    const setOtherThresholdPercentageInStore = (value) => {
        dispatch(setOtherThresholdPercentage(value));
    };

    const setValueAndCloseModal = () => {
        setOtherThresholdPercentageInStore(inputValue);
        setPreviousThreshold(inputValue);
        writeThresholdToLocalStorage(inputValue);
        toggleModalVisibility();
    };

    const cancelModal = () => {
        setInputValue(previousThreshold);
        setOtherThresholdPercentageInStore(previousThreshold);
        toggleModalVisibility();
    };

    const writeThresholdToLocalStorage = (value) => {
        localStorage.setItem("otherThresholdPercentage", JSON.stringify(value));
    };

    return (
    <Modal
      visible={modalVisible}
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      onOk={setValueAndCloseModal}
      onCancel={cancelModal}
    >
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
            onPressEnter={handleEnter}
          />
        </Col>
        Combine categories below this percentage into an &quot;Other&quot; category
      </Row>
    </Modal>
    );
};

OverviewSettingsControl.propTypes = {
    modalVisible: PropTypes.bool,
    toggleModalVisibility: PropTypes.func,
};

export default OverviewSettingsControl;
