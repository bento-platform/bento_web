import { useNavigate } from "react-router-dom";

import { analyzeData, RESOURCE_EVERYTHING } from "bento-auth-js";

import { useResourcePermissionsWrapper } from "@/hooks";
import { submitAnalysisWorkflowRun } from "@/modules/wes/actions";
import { useAppDispatch } from "@/store";

import ForbiddenContent from "../ForbiddenContent";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerAnalysisContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { permissions, hasAttemptedPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

  // TODO: each workflow should have definitions for permissions scopes, so we can instead check if we can run at
  //  least one workflow.

  if (hasAttemptedPermissions && !permissions.includes(analyzeData)) {
    return <ForbiddenContent message="You do not have permission to view the analysis wizard." />;
  }

  return (
    <RunSetupWizard
      workflowType="analysis"
      confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Analysis" {...props} />}
      onSubmit={({ selectedWorkflow, inputs }) => {
        dispatch(submitAnalysisWorkflowRun(selectedWorkflow, inputs, "/data/manager/runs", navigate));
      }}
    />
  );
};

export default ManagerAnalysisContent;
