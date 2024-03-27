import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { submitIngestionWorkflowRun } from "@/modules/wes/actions";

import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerIngestionContent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return <RunSetupWizard
        workflowType="ingestion"
        workflowSelectionDescription="Choose an ingestion workflow."
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Ingestion" {...props} />}
        onSubmit={({ selectedWorkflow, inputs }) => {
            dispatch(submitIngestionWorkflowRun(selectedWorkflow, inputs, "/data/manager/runs", navigate));
        }}
    />;
};

export default ManagerIngestionContent;
