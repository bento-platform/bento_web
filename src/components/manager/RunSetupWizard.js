import React, {useCallback, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {useLocation} from "react-router-dom";
import PropTypes from "prop-types";

import {Layout, Steps} from "antd";

import RunSetupInputForm from "./RunSetupInputForm";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {dropBoxTreeStateToPropsMixin} from "../../propTypes";
import {
    STEP_WORKFLOW_SELECTION,
    STEP_INPUT,
    STEP_CONFIRM,
} from "./workflowCommon";

const RunSetupWizard = ({
    workflowSelection,
    workflowSelectionTitle,
    workflowSelectionDescription,
    confirmDisplay,
    onSubmit,
}) => {
    const location = useLocation();

    const {tree} = useSelector(dropBoxTreeStateToPropsMixin);

    const [step, setStep] = useState(STEP_WORKFLOW_SELECTION);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);

    // Extra values (tables etc. for ingestion)
    const [workflowSelectionValues, setWorkflowSelectionValues] = useState({});

    const [inputs, setInputs] = useState({});
    const [initialInputValues, setInitialInputValues] = useState({});
    const [inputFormFields, setInputFormFields] = useState({});

    useEffect(() => {
        const {
            step: newStep,
            workflowSelectionValues: newWorkflowSelectionValues,
            selectedWorkflow: newSelectedWorkflow,
            initialInputValues: newInitialInputValues
        } = location?.state ?? {};

        if (newStep !== undefined) {
            setStep(newStep);
        }
        if (newWorkflowSelectionValues !== undefined) {
            setWorkflowSelectionValues(newWorkflowSelectionValues);
        }
        if (newSelectedWorkflow !== undefined) {
            setSelectedWorkflow(newSelectedWorkflow);
        }
        if (newInitialInputValues !== undefined) {
            setInitialInputValues(newInitialInputValues);
        }
    }, [location]);

    const handleWorkflowClick = useCallback((workflow) => {
        setSelectedWorkflow(workflow);
        setStep(STEP_INPUT);
    }, []);

    const handleInputSubmit = useCallback(inputs => {
        setInputs(inputs);
        setStep(STEP_CONFIRM);
    }, []);

    const handleRunWorkflow = useCallback(() => {
        onSubmit({
            workflowSelectionValues,
            selectedWorkflow,
            inputs,
        });
    }, [selectedWorkflow, inputs]);

    const getStepContents = useCallback(() => {
        switch (step) {
            case STEP_WORKFLOW_SELECTION:
                return workflowSelection({workflowSelectionValues, setWorkflowSelectionValues, handleWorkflowClick});
            case STEP_INPUT:
                return <RunSetupInputForm
                    workflow={selectedWorkflow}
                    tree={tree}
                    initialValues={initialInputValues}
                    formValues={inputFormFields}
                    onChange={setInputFormFields}
                    onSubmit={handleInputSubmit}
                    onBack={() => setStep(STEP_WORKFLOW_SELECTION)}
                />;
            case STEP_CONFIRM:
                return confirmDisplay({selectedWorkflow, workflowSelectionValues, inputs, handleRunWorkflow});
            default:
                return <div />;
        }
    }, [
        step,
        workflowSelectionValues,
        inputs,
        selectedWorkflow,
        tree,
        initialInputValues,
        inputFormFields,
        handleInputSubmit,
        handleWorkflowClick,
        handleRunWorkflow,
    ]);

    return <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Steps current={step} onChange={setStep}>
                <Steps.Step
                    title={workflowSelectionTitle ?? "Workflow"}
                    description={workflowSelectionDescription ?? "Choose a workflow."}
                />
                <Steps.Step
                    title="Input"
                    description="Select input data for the workflow."
                    disabled={step < STEP_INPUT && Object.keys(inputs).length === 0}
                />
                <Steps.Step
                    title="Run"
                    description="Confirm details and run the workflow."
                    disabled={step < STEP_CONFIRM && (selectedWorkflow === null || Object.keys(inputs).length === 0)}
                />
            </Steps>
            <div style={{marginTop: "16px"}}>{getStepContents()}</div>
        </Layout.Content>
    </Layout>;
};
RunSetupWizard.propTypes = {
    workflowSelection: PropTypes.func,
    workflowSelectionTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    workflowSelectionDescription: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    confirmDisplay: PropTypes.func,
    onSubmit: PropTypes.func,
};

export default RunSetupWizard;
