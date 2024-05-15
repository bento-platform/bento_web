import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { ingestData, ingestReferenceMaterial, RESOURCE_EVERYTHING } from "bento-auth-js";

import { useResourcePermissionsWrapper } from "@/hooks";
import { submitIngestionWorkflowRun } from "@/modules/wes/actions";

import ForbiddenContent from "../ForbiddenContent";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerIngestionContent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { permissions, hasAttemptedPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

    // TODO: each workflow should have definitions for permissions scopes, so we can instead check if we can run at
    //  least one workflow.

    if (
        hasAttemptedPermissions &&
        !(permissions.includes(ingestData) || permissions.includes(ingestReferenceMaterial))
    ) {
        return (
            <ForbiddenContent message="You do not have permission to view the ingestion wizard." />
        );
    }

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
