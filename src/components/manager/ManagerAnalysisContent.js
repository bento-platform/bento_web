import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";

import { Button, Form, List, message } from "antd";

import { submitAnalysisWorkflowRun } from "@/modules/wes/actions";
import WorkflowListItem from "./WorkflowListItem";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupInputsTable from "./RunSetupInputsTable";
import { FORM_BUTTON_COL, FORM_LABEL_COL, FORM_WRAPPER_COL } from "./workflowCommon";

const AnalysisConfirmDisplay = ({selectedWorkflow, inputs, handleRunWorkflow}) => {
    const isSubmittingAnalysisRun = useSelector(state => state.runs.isSubmittingAnalysisRun);

    return (
        <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
            <Form.Item label="Workflow">
                <List itemLayout="vertical" style={{marginBottom: "14px"}}>
                    <WorkflowListItem workflow={selectedWorkflow}/>
                </List>
            </Form.Item>
            <Form.Item label="Inputs">
                <RunSetupInputsTable selectedWorkflow={selectedWorkflow} inputs={inputs} />
            </Form.Item>
            <Form.Item wrapperCol={FORM_BUTTON_COL}>
                {/* TODO: Back button like the last one */}
                <Button type="primary"
                        style={{ marginTop: "16px", float: "right" }}
                        loading={isSubmittingAnalysisRun}
                        onClick={handleRunWorkflow}>
                    Run Analysis
                </Button>
            </Form.Item>
        </Form>
    );
};
AnalysisConfirmDisplay.propTypes = {
    selectedWorkflow: PropTypes.object,
    inputs: PropTypes.object,
    handleRunWorkflow: PropTypes.func,
};

const ManagerAnalysisContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    return <RunSetupWizard
        workflowType="analysis"
        confirmDisplay={props => <AnalysisConfirmDisplay {...props} />}
        onSubmit={({selectedWorkflow, inputs}) => {
            if (!selectedWorkflow) {
                message.error("Missing workflow selection; cannot submit run!");
                return;
            }

            dispatch(submitAnalysisWorkflowRun(
                selectedWorkflow.service_base_url,
                selectedWorkflow,
                inputs,
                "/admin/data/manager/runs",
                history,
            ));
        }}
    />;
};

export default ManagerAnalysisContent;
