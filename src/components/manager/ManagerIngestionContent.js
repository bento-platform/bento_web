import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

import { Empty, Form, List, Skeleton, Spin } from "antd";
const { Item } = Form;

import WorkflowListItem from "./WorkflowListItem";

import { submitIngestionWorkflowRun } from "../../modules/wes/actions";

import { STEP_WORKFLOW_SELECTION, STEP_INPUT, STEP_CONFIRM } from "./ingestion";

import IngestionInputForm from "./IngestionInputForm";
import TableTreeSelect from "./TableTreeSelect";

import { WORKFLOW_ACTION } from "../../constants";
import { withBasePath } from "../../utils/url";
import StepsTemplate from "./StepsTemplate";
import WorkflowConfirmationForm, { FIELD_OPTIONS } from "./WorkflowConfirmationForm";
import { filterWorkflows } from "../../utils/workflow";

// TODO: when redirected to this page from a Project/Dataset page,  doesn't defaults to selected Project/Dataset,
// fix: Have the select box input the value and pass that along
const ManagerIngestionContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    const tree = useSelector((state) => state.dropBox.tree);
    const servicesByID = useSelector((state) => state.services.itemsByID);
    const projectsByID = useSelector((state) => state.projects.itemsByID);
    const tablesByServiceID = useSelector((state) => state.serviceTables.itemsByServiceID);
    const isSubmittingIngestionRun = useSelector((state) => state.runs.isSubmittingIngestionRun);

    const workflows = useSelector((state) => filterWorkflows(state.serviceWorkflows.workflowsByServiceID));
    const workflowsLoading = useSelector(
        (state) => state.services.isFetchingAll || state.serviceWorkflows.isFetchingAll
    );

    const [step, setStep] = useState(STEP_WORKFLOW_SELECTION);
    const [selectedTable, setSelectedTable] = useState(location.state?.selectedTable ?? "");
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [initialInputValues, setInitialInputValues] = useState({});
    const [inputFormFields, setInputFormFields] = useState({});
    const [inputs, setInputs] = useState({});

    const handleWorkflowClick = (workflow) => {
        setStep(STEP_INPUT);
        setSelectedWorkflow(workflow);
        setInitialInputValues({});
        setInputFormFields({});
        setInputs({});
    };

    const handleInputSubmit = (inputs) => {
        setInputs(inputs);
        setStep(STEP_CONFIRM);
    };

    const handleRunIngestion = () => {
        // TODO: GUI error message
        if (!selectedTable || !selectedWorkflow) return;

        const serviceInfo = servicesByID[selectedWorkflow.serviceID];
        const tableID = selectedTable.split(":")[2];

        dispatch(
            submitIngestionWorkflowRun(
                serviceInfo,
                tableID,
                selectedWorkflow,
                inputs,
                withBasePath("admin/data/manager/runs"),
                history
            )
        );
    };

    const formatWithNameIfPossible = (name, id) => (name ? `${name} (${id})` : id);
    const [projectID, dataType, tableID] = selectedTable ?? selectedTable.split(":");
    const projectTitle = projectsByID[projectID]?.title;
    const tableName = tablesByServiceID[selectedWorkflow?.serviceID]?.tablesByID[tableID]?.name;

    const steps = [
        {
            title: "Table & Workflow",
            description: "Choose a table and ingestion workflow.",
            stepComponent: (
                <>
                    <Item label="Table">
                        <TableTreeSelect onChange={setSelectedTable} value={selectedTable} />
                    </Item>
                    <Item label="Workflows">
                        {selectedTable ? (
                            <Spin spinning={workflowsLoading}>
                                {workflowsLoading ? (
                                    <Skeleton />
                                ) : (
                                    <List itemLayout="vertical">
                                        {workflows
                                            .filter(
                                                (w) =>
                                                    w.action === WORKFLOW_ACTION.INGESTION &&
                                                    w.data_type === (selectedTable ? selectedTable.split(":")[1] : null)
                                            )
                                            .map((w) => (
                                                <WorkflowListItem
                                                    key={w.id}
                                                    workflow={w}
                                                    selectable={true}
                                                    onClick={() => handleWorkflowClick(w)}
                                                />
                                            ))}
                                    </List>
                                )}
                            </Spin>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Select a table to see available workflows"
                            />
                        )}
                    </Item>
                </>
            ),
        },
        {
            title: "Input",
            description: "Select input data for the workflow.",
            stepComponent: (
                <IngestionInputForm
                    workflow={selectedWorkflow}
                    tree={tree}
                    initialValues={initialInputValues}
                    formValues={inputFormFields}
                    onChange={(formValues) => setInputFormFields(formValues)}
                    onSubmit={handleInputSubmit}
                    onBack={() => setStep(0)}
                />
            ),
        },
        {
            title: "Run",
            description: "Confirm details and run the workflow..",
            stepComponent: (
                <WorkflowConfirmationForm
                    fields={[
                        {
                            title: "Project",
                            type: FIELD_OPTIONS.TEXT,
                            data: {
                                text: formatWithNameIfPossible(projectTitle, projectID),
                            },
                        },
                        {
                            title: "Data Type",
                            type: FIELD_OPTIONS.TAG,
                            data: { tag: dataType },
                        },
                        {
                            title: "Table",
                            type: FIELD_OPTIONS.TEXT,
                            data: {
                                text: formatWithNameIfPossible(tableName, tableID),
                            },
                        },
                        {
                            title: "Workflow",
                            type: FIELD_OPTIONS.WORKFLOW,
                            data: { selectedWorkflow },
                        },
                        {
                            title: "Inputs",
                            type: FIELD_OPTIONS.INPUTS,
                            data: {
                                dataSource: selectedWorkflow
                                    ? selectedWorkflow.inputs.map((i) => ({
                                        id: i.id,
                                        value: inputs[i.id],
                                    }))
                                    : [],
                            },
                        },
                        {
                            title: null,
                            type: FIELD_OPTIONS.SUBMIT,
                            data: {
                                loading: isSubmittingIngestionRun,
                                onClick: handleRunIngestion,
                                text: "Run Ingestion",
                            },
                        },
                    ]}
                />
            ),
        },
    ];

    return <StepsTemplate steps={steps} step={step} setStep={setStep} />;
};

export default ManagerIngestionContent;
