import React from "react";
import {useDispatch, useSelector} from "react-redux";
import PropTypes from "prop-types";

import {Button, Form, List, Skeleton, Spin} from "antd";

import {workflowsStateToPropsMixin} from "../../propTypes";
import WorkflowListItem from "./WorkflowListItem";
import {FORM_BUTTON_COL, FORM_LABEL_COL, FORM_WRAPPER_COL} from "./workflowCommon";
import {useHistory} from "react-router-dom";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupInputsTable from "./RunSetupInputsTable";
import {submitAnalysisWorkflowRun} from "../../modules/wes/actions";

const AnalysisWorkflowSelection = ({handleWorkflowClick}) => {
    const {workflows, workflowsLoading} = useSelector(workflowsStateToPropsMixin);

    const workflowItems = workflows.analysis.map(w =>
        <WorkflowListItem
            key={w.id}
            workflow={w}
            selectable={true}
            onClick={() => handleWorkflowClick(w)}
        />,
    );

    return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
        <Form.Item label="Workflows">
            <Spin spinning={workflowsLoading}>
                {workflowsLoading
                    ? <Skeleton/>
                    : <List itemLayout="vertical">{workflowItems}</List>}
            </Spin>
        </Form.Item>
    </Form>;
};
AnalysisWorkflowSelection.propTypes = {
    handleWorkflowClick: PropTypes.func,
};

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
                        style={{marginTop: "16px", float: "right"}}
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
    const servicesByID = useSelector(state => state.services.itemsByID);

    return <RunSetupWizard
        workflowSelection={({handleWorkflowClick}) => (
            <AnalysisWorkflowSelection handleWorkflowClick={handleWorkflowClick} />
        )}
        confirmDisplay={props => <AnalysisConfirmDisplay {...props} />}
        onSubmit={({selectedWorkflow, inputs}) => {
            if (!selectedWorkflow) {
                // TODO: GUI error message
                return;
            }
            const serviceInfo = servicesByID[selectedWorkflow.serviceID];
            dispatch(submitAnalysisWorkflowRun(
                serviceInfo,
                selectedWorkflow,
                inputs,
                "/admin/data/manager/runs",
                history,
            ));
        }}
    />;
};

export default ManagerAnalysisContent;
