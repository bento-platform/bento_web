import { useState } from "react";
import { Col, InputNumber, Row, Slider, Modal } from "antd";
import PropTypes from "prop-types";
import { DEFAULT_OTHER_THRESHOLD_PERCENTAGE } from "@/constants";
import { setOtherThresholdPercentage } from "@/modules/explorer/actions";
import { useAppDispatch, useAppSelector } from "@/store";
import { writeToLocalStorage } from "@/utils/localStorageUtils";

// currently only sets pie chart "Other" threshold:
// writes to redux store on all changes, writes to redux and localStorage on close
// initial threshold value is ether:
// - the value in the redux store
// - the value in localStorage if nothing in store
// - DEFAULT_OTHER_THRESHOLD_PERCENTAGE if redux and localStorage both empty

const toolTipFormatter = (value) => `${value}%`;
const sliderTooltip = { formatter: toolTipFormatter };

const OverviewSettingsControl = ({ modalVisible, toggleModalVisibility }) => {
  const otherThresholdPercentage = useAppSelector((state) => state.explorer.otherThresholdPercentage);
  const [inputValue, setInputValue] = useState(otherThresholdPercentage ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE);

  //preserve earlier setting in case user cancels
  const [previousThreshold, setPreviousThreshold] = useState(
    otherThresholdPercentage ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE,
  );
  const dispatch = useAppDispatch();

  const handleChange = (newValue) => {
    setInputValue(newValue);
    setOtherThresholdPercentageInStore(newValue);
  };

  const handleEnter = (e) => {
    e.preventDefault();
    setValueAndCloseModal();
  };

  const setOtherThresholdPercentageInStore = (value) => {
    dispatch(setOtherThresholdPercentage(value));
  };

  // only write to localStorage on close instead of at every change
  const setValueAndCloseModal = () => {
    setOtherThresholdPercentageInStore(inputValue);
    setPreviousThreshold(inputValue);
    writeToLocalStorage("otherThresholdPercentage", inputValue);
    toggleModalVisibility();
  };

  const cancelModal = () => {
    setInputValue(previousThreshold);
    setOtherThresholdPercentageInStore(previousThreshold);
    toggleModalVisibility();
  };

  return (
    <Modal
      open={modalVisible}
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      onOk={setValueAndCloseModal}
      onCancel={cancelModal}
    >
      <Row>
        <Col flex={1}>
          <Slider
            min={0}
            max={25}
            onChange={handleChange}
            value={typeof inputValue === "number" ? inputValue : 0}
            step={0.1}
            tooltip={sliderTooltip}
          />
        </Col>
        <Col>
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
