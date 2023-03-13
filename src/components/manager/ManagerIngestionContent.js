import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";

import {Button, Empty, Form, List, Skeleton, Spin, Table, Tag} from "antd";

import WorkflowListItem from "./WorkflowListItem";

import {submitIngestionWorkflowRun} from "../../modules/wes/actions";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
} from "./workflowCommon";

import TableTreeSelect from "./TableTreeSelect";

import {EM_DASH} from "../../constants";
import {withBasePath} from "../../utils/url";
import {workflowsStateToPropsMixin} from "../../propTypes";
import RunSetupWizard from "./RunSetupWizard";


const IngestWorkflowSelection = ({values, setValues, handleWorkflowClick}) => {
    const {workflows, workflowsLoading} = useSelector(workflowsStateToPropsMixin);
    const {selectedTable} = values;

    const workflowItems = workflows.ingestion
        .filter(w => w.data_type === (selectedTable ? selectedTable.split(":")[1] : null))
        .map(w =>
            <WorkflowListItem
                key={w.id}
                workflow={w}
                selectable={true}
                onClick={() => handleWorkflowClick(w)}
            />
        );

    return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
        <Form.Item label="Table">
            <TableTreeSelect
                onChange={t => setValues({selectedTable: t})}
                value={selectedTable}
            />
        </Form.Item>
        <Form.Item label="Workflows">
            {selectedTable
                ? <Spin spinning={workflowsLoading}>
                    {workflowsLoading
                        ? <Skeleton/>
                        : <List itemLayout="vertical">{workflowItems}</List>}
                </Spin>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                         description="Select a table to see available workflows"/>
            }
        </Form.Item>
    </Form>;
};

const IngestConfirmDisplay = ({selectedTable, selectedWorkflow, inputs, handleRunWorkflow}) => {
    const projectsByID = useSelector(state => state.projects.itemsByID);
    const tablesByServiceID = useSelector(state => state.serviceTables.itemsByServiceID);
    const isSubmittingIngestionRun = useSelector(state => state.runs.isSubmittingIngestionRun);

    const getTableName = (serviceID, tableID) => tablesByServiceID[serviceID]?.tablesByID?.[tableID]?.name;
    const formatWithNameIfPossible = (name, id) => name ? `${name} (${id})` : id;

    const [projectID, dataType, tableID] = selectedTable.split(":");
    const projectTitle = projectsByID[projectID]?.title || null;
    const tableName = getTableName(selectedWorkflow.serviceID, tableID);

    return (
        <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
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
                <List itemLayout="vertical" style={{marginBottom: "14px"}}>
                    <WorkflowListItem workflow={selectedWorkflow}/>
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
                            render: iID => <span style={{fontWeight: "bold", marginRight: "0.5em"}}>{iID}</span>,
                        },
                        {
                            title: "Value",
                            dataIndex: "value",
                            render: value =>
                                value === undefined
                                    ? EM_DASH
                                    : (value instanceof Array
                                            ? <ul>{value.map(v => <li key={v.toString()}>{v.toString()}</li>)}</ul>
                                            : value.toString()
                                    )
                        }
                    ]}
                    rowKey="id"
                    dataSource={selectedWorkflow.inputs.map(i => ({id: i.id, value: inputs[i.id]}))}
                />
            </Form.Item>
            <Form.Item wrapperCol={FORM_BUTTON_COL}>
                {/* TODO: Back button like the last one */}
                <Button type="primary"
                        style={{marginTop: "16px", float: "right"}}
                        loading={isSubmittingIngestionRun}
                        onClick={handleRunWorkflow}>
                    Run Ingestion
                </Button>
            </Form.Item>
        </Form>
    );
};


const ManagerIngestionContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const servicesByID = useSelector(state => state.services.itemsByID);

    return <RunSetupWizard
        workflowSelection={({workflowSelectionValues, setWorkflowSelectionValues, handleWorkflowClick}) => (
            <IngestWorkflowSelection
                values={workflowSelectionValues}
                setValues={setWorkflowSelectionValues}
                handleWorkflowClick={handleWorkflowClick}
            />
        )}
        confirmDisplay={({selectedWorkflow, workflowSelectionValues, inputs, handleRunWorkflow}) => (
            <IngestConfirmDisplay
                selectedTable={workflowSelectionValues.selectedTable}
                selectedWorkflow={selectedWorkflow}
                inputs={inputs}
                handleRunWorkflow={handleRunWorkflow}
            />
        )}
        onSubmit={({workflowSelectionValues, selectedWorkflow, inputs}) => {
            const {selectedTable} = workflowSelectionValues;

            if (!selectedTable || !selectedWorkflow) {
                // TODO: GUI error message
                return;
            }

            const serviceInfo = servicesByID[selectedWorkflow.serviceID];
            const tableID = selectedTable.split(":")[2];

            dispatch(submitIngestionWorkflowRun(
                serviceInfo,
                tableID,
                selectedWorkflow,
                inputs,
                withBasePath("admin/data/manager/runs"),
                history,
            ));
        }}
    />;
}

export default ManagerIngestionContent;
