import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import { Layout, Steps } from "antd";

import RunSetupInputForm from "./RunSetupInputForm";

import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";
import { STEP_WORKFLOW_SELECTION, STEP_INPUT, STEP_CONFIRM } from "./workflowCommon";
import WorkflowSelection from "./WorkflowSelection";
import { workflowTypePropType } from "@/propTypes";

const RunSetupWizard = ({
  workflowType,
  workflowSelectionTitle,
  workflowSelectionDescription,
  confirmDisplay,
  onSubmit,
}) => {
  const location = useLocation();

  const [step, setStep] = useState(STEP_WORKFLOW_SELECTION);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const [inputs, setInputs] = useState({});
  const [initialWorkflowFilterValues, setInitialWorkflowFilterValues] = useState(undefined);
  const [initialInputValues, setInitialInputValues] = useState({});
  const [inputFormFields, setInputFormFields] = useState({});

  useEffect(() => {
    const {
      step: newStep,
      initialWorkflowFilterValues: newInitialWorkflowFilterValues,
      selectedWorkflow: newSelectedWorkflow,
      initialInputValues: newInitialInputValues,
    } = location?.state ?? {};

    if (newStep !== undefined) {
      setStep(newStep);
    }
    if (newInitialWorkflowFilterValues !== undefined) {
      setInitialWorkflowFilterValues(newInitialWorkflowFilterValues);
    }
    if (newSelectedWorkflow !== undefined) {
      setSelectedWorkflow(newSelectedWorkflow);
    }
    if (newInitialInputValues !== undefined) {
      setInitialInputValues(newInitialInputValues);
    }
  }, [location]);

  const handleWorkflowClick = useCallback(
    (workflow) => {
      if (workflow.id !== selectedWorkflow?.id) {
        // If we had pre-defined initial values / form values, but we change the workflow, reset these inputs.
        setInitialInputValues({});
        setInputFormFields({});

        // Change to the new selected workflow
        setSelectedWorkflow(workflow);
      }
      setStep(STEP_INPUT);
    },
    [selectedWorkflow],
  );

  const stepItems = useMemo(
    () => [
      {
        title: workflowSelectionTitle ?? "Workflow",
        description: workflowSelectionDescription ?? "Choose a workflow.",
      },
      {
        title: "Input",
        description: "Select input data for the workflow.",
        disabled: step < STEP_INPUT && Object.keys(inputs).length === 0,
      },
      {
        title: "Run",
        description: "Confirm details and run the workflow.",
        disabled: step < STEP_CONFIRM && (selectedWorkflow === null || Object.keys(inputs).length === 0),
      },
    ],
    [workflowSelectionTitle, workflowSelectionDescription, step, inputs, selectedWorkflow],
  );

  const getStepContents = useCallback(() => {
    switch (step) {
      case STEP_WORKFLOW_SELECTION:
        return (
          <WorkflowSelection
            workflowType={workflowType}
            initialFilterValues={initialWorkflowFilterValues}
            handleWorkflowClick={handleWorkflowClick}
          />
        );
      case STEP_INPUT:
        return (
          <RunSetupInputForm
            workflow={selectedWorkflow}
            initialValues={initialInputValues}
            formValues={inputFormFields}
            onChange={setInputFormFields}
            onSubmit={(inputs) => {
              setInputs(inputs);
              setStep(STEP_CONFIRM);
            }}
            onBack={() => setStep(STEP_WORKFLOW_SELECTION)}
          />
        );
      case STEP_CONFIRM:
        return confirmDisplay({
          selectedWorkflow,
          inputs,
          handleRunWorkflow: () => {
            if (!selectedWorkflow) {
              console.error("handleRunWorkflow called without a selected workflow");
              return;
            }
            onSubmit({ selectedWorkflow, inputs });
          },
        });
      default:
        return <div />;
    }
  }, [
    confirmDisplay,
    handleWorkflowClick,
    initialInputValues,
    initialWorkflowFilterValues,
    inputFormFields,
    inputs,
    onSubmit,
    selectedWorkflow,
    step,
    workflowType,
  ]);

  return (
    <Layout>
      <Layout.Content style={LAYOUT_CONTENT_STYLE}>
        <Steps current={step} onChange={setStep} items={stepItems} />
        <div style={{ marginTop: "16px" }}>{getStepContents()}</div>
      </Layout.Content>
    </Layout>
  );
};
RunSetupWizard.propTypes = {
  workflowType: workflowTypePropType,
  workflowSelectionTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  workflowSelectionDescription: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  confirmDisplay: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default RunSetupWizard;
