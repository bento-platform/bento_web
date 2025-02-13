import { useNavigate } from "react-router-dom";

import { analyzeData, RESOURCE_EVERYTHING } from "bento-auth-js";

import { submitAnalysisWorkflowRun } from "@/modules/wes/actions";
import { useAppDispatch } from "@/store";

import PermissionsGate from "@/components/PermissionsGate";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerAnalysisContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // TODO: each workflow should have definitions for permissions scopes, so we can instead check if we can run at
  //  least one workflow.

  return (
    <PermissionsGate
      requiredPermissions={[analyzeData]}
      resource={RESOURCE_EVERYTHING}
      forbiddenMessage="You do not have permission to view the analysis wizard."
    >
      <RunSetupWizard
        workflowType="analysis"
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Analysis" {...props} />}
        onSubmit={({ selectedWorkflow, inputs }) => {
          dispatch(submitAnalysisWorkflowRun(selectedWorkflow, inputs, "/data/manager/runs", navigate));
        }}
      />
    </PermissionsGate>
  );
};

export default ManagerAnalysisContent;
