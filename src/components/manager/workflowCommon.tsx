import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import type { Workflow, WorkflowRunInputs } from "@/modules/wes/types";

export const FORM_LABEL_COL = { md: { span: 24 }, lg: { span: 4 }, xl: { span: 6 } };
export const FORM_WRAPPER_COL = { md: { span: 24 }, lg: { span: 16 }, xl: { span: 12 } };
export const FORM_BUTTON_COL = {
  md: { span: 24 },
  lg: { offset: 4, span: 16 },
  xl: { offset: 6, span: 12 },
};

export const STEP_WORKFLOW_SELECTION = 0;
export const STEP_INPUT = 1;
export const STEP_CONFIRM = 2;

export const useStartIngestionFlow = () => {
  const navigate = useNavigate();
  return useCallback(
    (selectedWorkflow: Workflow, initialInputValues: WorkflowRunInputs | undefined = undefined) => {
      navigate("/data/manager/ingestion", {
        state: {
          step: STEP_INPUT,
          initialWorkflowFilterValues: {
            text: "",
            tags: [...(selectedWorkflow.tags ?? [])],
          },
          selectedWorkflow,
          initialInputValues,
        },
      });
    },
    [navigate],
  );
};
