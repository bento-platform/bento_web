import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { submitExportWorkflowRun } from "@/modules/wes/actions";

import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerExportContent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return <RunSetupWizard
        workflowType="export"
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Export" {...props} />}
        onSubmit={({ selectedWorkflow, inputs }) => {
            dispatch(submitExportWorkflowRun(selectedWorkflow, inputs, "/data/manager/runs", navigate));
        }}
    />;
};

export default ManagerExportContent;
