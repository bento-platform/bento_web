import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Button, Form, List } from "antd";

import WorkflowListItem from "./WorkflowListItem";
import RunSetupInputsTable from "./RunSetupInputsTable";
import { FORM_BUTTON_COL, FORM_LABEL_COL, FORM_WRAPPER_COL } from "./workflowCommon";

/** @type {Object.<string, React.CSSProperties>} */
const styles = {
    workflowListItem: { marginBottom: "14px" },
    runButton: { marginTop: "16px", float: "right" },
};

const RunSetupConfirmDisplay = ({ selectedWorkflow, inputs, handleRunWorkflow, runButtonText }) => {
    const isSubmittingRun = useSelector((state) => state.runs.isSubmittingRun);

    return (
        <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
            <Form.Item label="Workflow">
                <List itemLayout="vertical" style={styles.workflowListItem}>
                    <WorkflowListItem workflow={selectedWorkflow}/>
                </List>
            </Form.Item>
            <Form.Item label="Inputs">
                <RunSetupInputsTable selectedWorkflow={selectedWorkflow} inputs={inputs} />
            </Form.Item>
            <Form.Item wrapperCol={FORM_BUTTON_COL}>
                {/* TODO: Back button like the last one */}
                <Button type="primary" style={styles.runButton} loading={isSubmittingRun} onClick={handleRunWorkflow}>
                    {runButtonText}
                </Button>
            </Form.Item>
        </Form>
    );
};

RunSetupConfirmDisplay.propTypes = {
    selectedWorkflow: PropTypes.object,
    inputs: PropTypes.object,
    handleRunWorkflow: PropTypes.func,
    runButtonText: PropTypes.string,
};

export default RunSetupConfirmDisplay;
