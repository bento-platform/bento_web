import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

import {
    Button,
    Empty,
    Form,
    List,
    Skeleton,
    Spin,
    Table,
} from "antd";
const { Item } = Form;

import WorkflowListItem from "./WorkflowListItem";

import { submitIngestionWorkflowRun } from "../../modules/wes/actions";

import {
    FORM_BUTTON_COL,
    STEP_WORKFLOW_SELECTION,
    STEP_CONFIRM,
} from "./ingestion";

import DatasetTreeSelect from "./DatasetTreeSelect";

import { EM_DASH, WORKFLOW_ACTION } from "../../constants";
import { withBasePath } from "../../utils/url";
import StepsTemplate from "./StepsTemplate";

const ManagerAnalyzeContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const locationState = useLocation()?.state;

    const managerType = WORKFLOW_ACTION.ANALYSIS;

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
    const [step, setStep] = useState(
        locationState?.step || STEP_WORKFLOW_SELECTION
    );
    const [selectedDataset, setSelectedDataset] = useState(
        locationState?.selectedDataset || null
    );
    const [selectedWorkflow, setSelectedWorkflow] = useState(
        locationState?.selectedWorkflow || null
    );
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
                        <DatasetTreeSelect
                            onChange={setSelectedDataset}
                            value={selectedDataset}
                        />
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
                    <Item label="Dataset">{getDatasetDisplayTitle()}</Item>
                    <Item label="Workflow">
                        <List
                            itemLayout="vertical"
                            style={{ marginBottom: "14px" }}
                        >
                            <WorkflowListItem workflow={selectedWorkflow} />
                        </List>
                    </Item>
                    <Item label="Inputs">
                        <Table
                            size="small"
                            bordered={true}
                            showHeader={false}
                            pagination={false}
                            columns={[
                                {
                                    title: "ID",
                                    dataIndex: "id",
                                    render: (iID) => (
                                        <span
                                            style={{
                                                fontWeight: "bold",
                                                marginRight: "0.5em",
                                            }}
                                        >
                                            {iID}
                                        </span>
                                    ),
                                },
                                {
                                    title: "Value",
                                    dataIndex: "value",
                                    render: (value) =>
                                        value === undefined ? (
                                            EM_DASH
                                        ) : value instanceof Array ? (
                                            <ul>
                                                {value.map((v) => (
                                                    <li key={v.toString()}>
                                                        {v.toString()}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            value.toString()
                                        ),
                                },
                            ]}
                            rowKey="id"
                            dataSource={
                                selectedWorkflow
                                    ? selectedWorkflow.inputs.map((i) => ({
                                          id: i.id,
                                          value: inputs[i.id],
                                      }))
                                    : []
                            }
                        />
                    </Item>
                    <Item wrapperCol={FORM_BUTTON_COL}>
                        {/* TODO: Back button like the last one */}
                        <Button
                            type="primary"
                            style={{ marginTop: "16px", float: "right" }}
                            loading={isSubmittingIngestionRun}
                            onClick={handleRunIngestion}
                        >
                            <span style={{ textTransform: "capitalize" }}>
                                Run {managerType}
                            </span>
                        </Button>
                    </Item>
                </>
            ),
            disabled:
                step < STEP_CONFIRM && Object.keys(inputs).length === 0,
        },
    ];

    return <StepsTemplate steps={steps} step={step} setStep={setStep} />;
};

export default ManagerAnalyzeContent;
