import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { Empty, Form, List, Skeleton, Spin } from "antd";
const { Item } = Form;

import WorkflowListItem from "./WorkflowListItem";

import { submitIngestionWorkflowRun } from "../../modules/wes/actions";


import DatasetTreeSelect from "./DatasetTreeSelect";

import { withBasePath } from "../../utils/url";
import StepsTemplate from "./StepsTemplate";
import WorkflowConfirmationForm, {
    FIELD_OPTIONS,
} from "./WorkflowConfirmationForm";

const ManagerWorkflowInterfaceContent = ({ managerType }) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const servicesByID = useSelector((state) => state.services.itemsByID);
    const datasetsByID = useSelector((state) =>
        Object.fromEntries(
            Object.values(state.projects.itemsByID).flatMap((p) =>
                p.datasets.map((d) => [d.identifier, d])
            )
        )
    );
    const isSubmittingIngestionRun = useSelector(
        (state) => state.runs.isSubmittingIngestionRun
    );

    const workflows = useSelector((state) =>
        Object.entries(state.serviceWorkflows.workflowsByServiceID)
            .filter(([_, s]) => !s.isFetching)
            .flatMap(([serviceID, s]) =>
                Object.entries(s.workflows).flatMap(
                    ([action, workflowsByAction]) =>
                        Object.entries(workflowsByAction).map(([id, v]) => ({
                            ...v,
                            id, // e.g. phenopacket_json, vcf_gz
                            serviceID,
                            action,
                        }))
                )
            )
    );

    const workflowsLoading = useSelector(
        (state) =>
            state.services.isFetchingAll || state.serviceWorkflows.isFetchingAll
    );

    // TODO: Move selectedDataset to redux?
    const [step, setStep] = useState(STEP_WORKFLOW_SELECTION);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [inputs, setInputs] = useState({});

    const getId = () => selectedDataset && selectedDataset.split(":")[1];

    const handleWorkflowClick = (workflow) => {
        const hiddenInputs = Object.fromEntries(
            workflow.inputs
                .filter((value) => value?.hidden)
                .map((i) => [i.id, i.value])
        );
        const dataset_id = getId();
        const dataset_name = datasetsByID[dataset_id]?.title ?? dataset_id;

        setStep(STEP_CONFIRM);
        setSelectedWorkflow(workflow);
        setInputs({ ...hiddenInputs, dataset_id, dataset_name });
    };

    const handleRunIngestion = () => {
        // TODO: GUI error message
        if (!selectedDataset || !selectedWorkflow) return;

        const serviceInfo = servicesByID[selectedWorkflow.serviceID];
        const datasetID = getId();

        dispatch(
            submitIngestionWorkflowRun(
                serviceInfo,
                datasetID,
                selectedWorkflow,
                inputs,
                withBasePath("admin/data/manager/runs"),
                history
            )
        );
    };

    const getDatasetDisplayTitle = () => {
        const datasetId = getId();
        const title = datasetsByID[datasetId]?.title;
        return title ? `${title} (${datasetId})` : datasetId;
    };

    const steps = [
        // STEP_WORKFLOW_SELECTION
        {
            title: "Dataset & Workflow",
            description: "Choose a dataset and analysis workflow.",
            stepComponent: (
                <>
                    <Item label="Dataset">
                        <DatasetTreeSelect onChange={setSelectedDataset} />
                    </Item>
                    <Item label="Workflows">
                        {selectedDataset ? (
                            <Spin spinning={workflowsLoading}>
                                {workflowsLoading ? (
                                    <Skeleton />
                                ) : (
                                    <List itemLayout="vertical">
                                        {workflows
                                            .filter(
                                                (w) => w.action === managerType
                                            )
                                            .map((w) => (
                                                <WorkflowListItem
                                                    key={w.id}
                                                    workflow={w}
                                                    selectable={true}
                                                    onClick={() =>
                                                        handleWorkflowClick(w)
                                                    }
                                                />
                                            ))}
                                    </List>
                                )}
                            </Spin>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Select a dataset to see available workflows"
                            />
                        )}
                    </Item>
                </>
            ),
        },
        // STEP_CONFIRM
        {
            title: "Run",
            description: "Choose a dataset and analysis workflow.",
            stepComponent: (
                <>
                    <WorkflowConfirmationForm
                        fields={[
                            {
                                title: "Dataset",
                                type: FIELD_OPTIONS.TEXT,
                                data: { text: getDatasetDisplayTitle() },
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
                                    text: `Run ${managerType}`,
                                },
                            },
                        ]}
                    />
                </>
            ),
            disabled: step < STEP_CONFIRM && Object.keys(inputs).length === 0,
        },
    ];

    return <StepsTemplate steps={steps} step={step} setStep={setStep} />;
};

export default ManagerWorkflowInterfaceContent;

export const [STEP_WORKFLOW_SELECTION, STEP_CONFIRM] = [0, 1];
