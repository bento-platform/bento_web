import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { message } from "antd";

import { submitIngestionWorkflowRun } from "@/modules/wes/actions";

import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerIngestionContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    return <RunSetupWizard
        workflowType="ingestion"
        workflowSelectionDescription="Choose an ingestion workflow."
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Ingestion" {...props} />}
        onSubmit={({ selectedWorkflow, inputs }) => {
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
