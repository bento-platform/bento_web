import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { submitAnalysisWorkflowRun } from "@/modules/wes/actions";

import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerAnalysisContent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return <RunSetupWizard
        workflowType="analysis"
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Analysis" {...props} />}
        onSubmit={({ selectedWorkflow, inputs }) => {
            dispatch(submitAnalysisWorkflowRun(selectedWorkflow, inputs, "/data/manager/runs", navigate));
        }}
    />;
};

export default ManagerAnalysisContent;
