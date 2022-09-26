import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import {
    Button,
    Empty,
    Form,
    Layout,
    List,
    Skeleton,
    Spin,
    Steps,
    Table,
    Tag,
} from "antd";

import WorkflowListItem from "./WorkflowListItem";

import { submitIngestionWorkflowRun } from "../../modules/wes/actions";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
    STEP_WORKFLOW_SELECTION,
    STEP_INPUT,
    STEP_CONFIRM,
} from "./ingestion";

import IngestionInputForm from "./IngestionInputForm";
import TableTreeSelect from "./TableTreeSelect";

import { EM_DASH, WORKFLOW_ACTION } from "../../constants";
import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";
import { withBasePath } from "../../utils/url";

const ManagerIngestionContent = ({}) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const tree = useSelector((state) => state.dropBox.tree);
    const servicesByID = useSelector((state) => state.services.itemsByID);
    const projectsByID = useSelector((state) => state.projects.itemsByID);
    const tablesByServiceID = useSelector(
        (state) => state.serviceTables.itemsByServiceID
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

    const [step, setStep] = useState(STEP_WORKFLOW_SELECTION);
    const [selectedTable, setSelectedTable] = useState(null);
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
        if (!selectedTable || !selectedWorkflow) {
            // TODO: GUI error message
            return;
        }

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

    const getStepContents = () => {
        const getTableName = (serviceID, tableID) =>
            (
                ((tablesByServiceID[serviceID] || {}).tablesByID || {})[
                    tableID
                    ] || {}
            ).name;

        const formatWithNameIfPossible = (name, id) =>
            name ? `${name} (${id})` : id;

        switch (step) {
            case STEP_WORKFLOW_SELECTION: {
                return (
                    <Form
                        labelCol={FORM_LABEL_COL}
                        wrapperCol={FORM_WRAPPER_COL}
                    >
                        <Form.Item label="Table">
                            <TableTreeSelect
                                onChange={(table) => setSelectedTable(table)}
                                value={selectedTable}
                            />
                        </Form.Item>
                        <Form.Item label="Workflows">
                            {selectedTable ? (
                                <Spin spinning={workflowsLoading}>
                                    {workflowsLoading ? (
                                        <Skeleton />
                                    ) : (
                                        <List itemLayout="vertical">
                                            {workflows
                                                .filter(
                                                    (w) =>
                                                        w.action ===
                                                        WORKFLOW_ACTION.INGESTION &&
                                                        w.data_type ===
                                                        (selectedTable
                                                            ? selectedTable.split(
                                                                ":"
                                                            )[1]
                                                            : null)
                                                )
                                                .map((w) => (
                                                    <WorkflowListItem
                                                        key={w.id}
                                                        workflow={w}
                                                        selectable={true}
                                                        onClick={() =>
                                                            handleWorkflowClick(
                                                                w
                                                            )
                                                        }
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
                        </Form.Item>
                    </Form>
                );
            }

            case STEP_INPUT:
                return (
                    <IngestionInputForm
                        workflow={selectedWorkflow}
                        tree={tree}
                        initialValues={initialInputValues}
                        formValues={inputFormFields}
                        onChange={(formValues) =>
                            setInputFormFields(formValues)
                        }
                        onSubmit={handleInputSubmit}
                        onBack={() => setStep(0)}
                    />
                );

            case STEP_CONFIRM: {
                const [projectID, dataType, tableID] = selectedTable.split(":");
                const projectTitle =
                    (projectsByID[projectID] || { title: null }).title || null;
                const tableName = getTableName(
                    selectedWorkflow.serviceID,
                    tableID
                );

                return (
                    <Form
                        labelCol={FORM_LABEL_COL}
                        wrapperCol={FORM_WRAPPER_COL}
                    >
                        <Form.Item label="Project">
                            {formatWithNameIfPossible(projectTitle, projectID)}
                        </Form.Item>
                        <Form.Item label="Data Type">
                            <Tag>{dataType}</Tag>
                        </Form.Item>
                        <Form.Item label="Table">
                            {formatWithNameIfPossible(tableName, tableID)}
                        </Form.Item>
                        <Form.Item label="Workflow">
                            <List
                                itemLayout="vertical"
                                style={{ marginBottom: "14px" }}
                            >
                                <WorkflowListItem workflow={selectedWorkflow} />
                            </List>
                        </Form.Item>
                        <Form.Item label="Inputs">
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
                                dataSource={selectedWorkflow.inputs.map(
                                    (i) => ({
                                        id: i.id,
                                        value: inputs[i.id],
                                    })
                                )}
                            />
                        </Form.Item>
                        <Form.Item wrapperCol={FORM_BUTTON_COL}>
                            {/* TODO: Back button like the last one */}
                            <Button
                                type="primary"
                                style={{ marginTop: "16px", float: "right" }}
                                loading={isSubmittingIngestionRun}
                                onClick={handleRunIngestion}
                            >
                                Run Ingestion
                            </Button>
                        </Form.Item>
                    </Form>
                );
            }
        }
    };

    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Steps current={step} onChange={setStep}>
                    <Steps.Step
                        title="Table & Workflow"
                        description={
                            <span style={{ letterSpacing: "-0.1px" }}>
                                Choose a table and ingestion workflow.
                            </span>
                        }
                    ></Steps.Step>
                    <Steps.Step
                        title="Input"
                        description="Select input data for the workflow."
                        disabled={
                            step < STEP_INPUT &&
                            Object.keys(inputs).length === 0
                        }
                    />
                    <Steps.Step
                        title="Run"
                        description="Confirm details and run the workflow."
                        disabled={
                            step < STEP_CONFIRM &&
                            (selectedWorkflow === null ||
                                Object.keys(inputs).length === 0)
                        }
                    />
                </Steps>
                <div style={{ marginTop: "16px" }}>{getStepContents()}</div>
            </Layout.Content>
        </Layout>
    );
};

export default ManagerIngestionContent;
