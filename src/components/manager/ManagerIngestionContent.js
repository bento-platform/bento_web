import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Empty, Form, List, Skeleton, Spin, Tag, message} from "antd";

import WorkflowListItem from "./WorkflowListItem";

import {submitIngestionWorkflowRun} from "../../modules/wes/actions";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
} from "./workflowCommon";

import TableTreeSelect from "./TableTreeSelect";

import {withBasePath} from "../../utils/url";
import {workflowsStateToPropsMixin} from "../../propTypes";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupInputsTable from "./RunSetupInputsTable";


const IngestWorkflowSelection = ({values, setValues, handleWorkflowClick}) => {
    const {workflows, workflowsLoading} = useSelector(workflowsStateToPropsMixin);
    const {selectedTable} = values;

    const workflowItems = workflows.ingestion
        .filter(w => w.data_type === (selectedTable ? selectedTable.split(":")[1] : null))
        .map(w =>
            <WorkflowListItem
                key={w.id}
                workflow={w}
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
IngestWorkflowSelection.propTypes = {
    values: PropTypes.shape({
        selectedTable: PropTypes.string,
    }),
    setValues: PropTypes.func,
    handleWorkflowClick: PropTypes.func,
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
                <RunSetupInputsTable selectedWorkflow={selectedWorkflow} inputs={inputs} />
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
IngestConfirmDisplay.propTypes = {
    selectedTable: PropTypes.string,
    selectedWorkflow: PropTypes.object,
    inputs: PropTypes.object,
    handleRunWorkflow: PropTypes.func,
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
        workflowSelectionTitle="Table & Workflow"
        workflowSelectionDescription={
            <span style={{letterSpacing: "-0.1px"}}>Choose a table and ingestion workflow.</span>
        }
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
                message.error(`Missing ${selectedTable ? "workflow" : "table"} selection; cannot submit run!`);
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
};

export default ManagerIngestionContent;
