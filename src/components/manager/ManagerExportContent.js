import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { submitExportWorkflowRun } from "@/modules/wes/actions";

import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerExportContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    return <RunSetupWizard
        workflowType="export"
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Export" {...props} />}
        onSubmit={({selectedWorkflow, inputs}) => {
            dispatch(submitExportWorkflowRun(selectedWorkflow, inputs, "/admin/data/manager/runs", history));
        }}
    />;
};

export default ManagerExportContent;
