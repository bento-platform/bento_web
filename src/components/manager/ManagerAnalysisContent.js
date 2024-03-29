import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { submitAnalysisWorkflowRun } from "@/modules/wes/actions";

import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerAnalysisContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    return <RunSetupWizard
        workflowType="analysis"
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Analysis" {...props} />}
        onSubmit={({selectedWorkflow, inputs}) => {
            dispatch(submitAnalysisWorkflowRun(selectedWorkflow, inputs, "/admin/data/manager/runs", history));
        }}
    />;
};

export default ManagerAnalysisContent;
