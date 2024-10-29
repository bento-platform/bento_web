import { useNavigate } from "react-router-dom";

import { exportData, RESOURCE_EVERYTHING } from "bento-auth-js";

import { useResourcePermissionsWrapper } from "@/hooks";
import { submitExportWorkflowRun } from "@/modules/wes/actions";
import { useAppDispatch } from "@/store";

import ForbiddenContent from "../ForbiddenContent";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const ManagerExportContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { permissions, hasAttemptedPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

  // TODO: each workflow should have definitions for permissions scopes, so we can instead check if we can run at
  //  least one workflow.

  if (hasAttemptedPermissions && !permissions.includes(exportData)) {
    return <ForbiddenContent message="You do not have permission to view the export wizard." />;
  }

  return (
    <RunSetupWizard
      workflowType="export"
      confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Export" {...props} />}
      onSubmit={({ selectedWorkflow, inputs }) => {
        dispatch(submitExportWorkflowRun(selectedWorkflow, inputs, "/data/manager/runs", navigate));
      }}
    />
  );
};

export default ManagerExportContent;
