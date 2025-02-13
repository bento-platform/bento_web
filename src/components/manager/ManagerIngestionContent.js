import { useNavigate } from "react-router-dom";

import { ingestData, ingestReferenceMaterial, RESOURCE_EVERYTHING } from "bento-auth-js";

import { submitIngestionWorkflowRun } from "@/modules/wes/actions";
import { useAppDispatch } from "@/store";

import PermissionsGate from "@/components/PermissionsGate";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerIngestionContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // TODO: each workflow should have definitions for permissions scopes, so we can instead check if we can run at
  //  least one workflow.

  return (
    <PermissionsGate
      resource={RESOURCE_EVERYTHING}
      requiredPermissions={[ingestData, ingestReferenceMaterial]}
      forbiddenMessage="You do not have permission to view the ingestion wizard."
    >
      <RunSetupWizard
        workflowType="ingestion"
        workflowSelectionDescription="Choose an ingestion workflow."
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Ingestion" {...props} />}
        onSubmit={({ selectedWorkflow, inputs }) => {
          dispatch(submitIngestionWorkflowRun(selectedWorkflow, inputs, "/data/manager/runs", navigate));
        }}
      />
    </PermissionsGate>
  );
};

export default ManagerIngestionContent;
