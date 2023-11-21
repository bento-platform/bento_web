import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Form, List, message} from "antd";

import WorkflowListItem from "./WorkflowListItem";

import {submitIngestionWorkflowRun} from "../../modules/wes/actions";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
} from "./workflowCommon";

import RunSetupWizard from "./RunSetupWizard";
import RunSetupInputsTable from "./RunSetupInputsTable";

const TitleAndID = React.memo(({title, id}) => title ? <span>{title} ({id})</span> : <span>{id}</span>);
TitleAndID.propTypes = {
    title: PropTypes.string,
    id: PropTypes.string,
};

const STYLE_RUN_INGESTION = {marginTop: "16px", float: "right"};

const IngestConfirmDisplay = ({selectedWorkflow, inputs, handleRunWorkflow}) => {
    const isSubmittingIngestionRun = useSelector(state => state.runs.isSubmittingIngestionRun);

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
                        style={STYLE_RUN_INGESTION}
                        loading={isSubmittingIngestionRun}
                        onClick={handleRunWorkflow}>
                    Run Ingestion
                </Button>
            </Form.Item>
        </Form>
    );
};
IngestConfirmDisplay.propTypes = {
    selectedWorkflow: PropTypes.object,
    inputs: PropTypes.object,
    handleRunWorkflow: PropTypes.func,
};


const ManagerIngestionContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    return <RunSetupWizard
        workflowType="ingestion"
        workflowSelectionTitle="Workflow"
        workflowSelectionDescription="Choose an ingestion workflow."
        confirmDisplay={({selectedWorkflow, inputs, handleRunWorkflow}) => (
            <IngestConfirmDisplay
                selectedWorkflow={selectedWorkflow}
                inputs={inputs}
                handleRunWorkflow={handleRunWorkflow}
            />
        )}
        onSubmit={({selectedWorkflow, inputs}) => {
            if (!selectedWorkflow) {
                message.error("Missing workflow selection; cannot submit run!");
                return;
            }

            dispatch(submitIngestionWorkflowRun(
                selectedWorkflow.service_base_url,
                selectedWorkflow,
                inputs,
                "/admin/data/manager/runs",
                history,
            ));
        }}
    />;
};

export default ManagerIngestionContent;
