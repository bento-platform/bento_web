import { useNavigate } from "react-router-dom";

import { exportData, RESOURCE_EVERYTHING } from "bento-auth-js";

import { submitExportWorkflowRun } from "@/modules/wes/actions";
import { useAppDispatch } from "@/store";

import PermissionsGate from "@/components/PermissionsGate";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupConfirmDisplay from "./RunSetupConfirmDisplay";

const EXPORT_CHECK = { resource: RESOURCE_EVERYTHING, requiredPermissions: [exportData] };

const ManagerExportContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // TODO: each workflow should have definitions for permissions scopes, so we can instead check if we can run at
  //  least one workflow.

  return (
    <PermissionsGate check={EXPORT_CHECK} forbiddenMessage="You do not have permission to view the export wizard.">
      <RunSetupWizard
        workflowType="export"
        confirmDisplay={(props) => <RunSetupConfirmDisplay runButtonText="Run Export" {...props} />}
        onSubmit={({ selectedWorkflow, inputs }) => {
          dispatch(submitExportWorkflowRun(selectedWorkflow, inputs, "/data/manager/runs", navigate));
        }}
      />
    </PermissionsGate>
  );
};

export default ManagerExportContent;
