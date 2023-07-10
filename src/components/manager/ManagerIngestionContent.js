import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Empty, Form, List, Skeleton, Spin, message} from "antd";

import WorkflowListItem from "./WorkflowListItem";

import {submitIngestionWorkflowRun} from "../../modules/wes/actions";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,
} from "./workflowCommon";

import DatasetTreeSelect from "./DatasetTreeSelect";

import {workflowsStateToPropsMixin} from "../../propTypes";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupInputsTable from "./RunSetupInputsTable";


const IngestWorkflowSelection = ({values, setValues, handleWorkflowClick}) => {
    const {workflows, workflowsLoading} = useSelector(workflowsStateToPropsMixin);
    const {selectedDataset} = values;

    const workflowItems = workflows.ingestion
        .filter(w => w.data_type === (selectedDataset ? selectedDataset.split(":")[1] : null))
        .map(w =>
            <WorkflowListItem
                key={w.id}
                workflow={w}
                onClick={() => handleWorkflowClick(w)}
            />,
        );

    return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
        <Form.Item label="Dataset">
            <DatasetTreeSelect
                onChange={t => setValues({selectedDataset: t})}
                value={selectedDataset}
            />
        </Form.Item>
        <Form.Item label="Workflows">
            {selectedDataset
                ? <Spin spinning={workflowsLoading}>
                    {workflowsLoading
                        ? <Skeleton/>
                        : <List itemLayout="vertical">{workflowItems}</List>}
                </Spin>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                         description="Select a dataset to see available workflows"/>
            }
        </Form.Item>
    </Form>;
};
IngestWorkflowSelection.propTypes = {
    values: PropTypes.shape({
        selectedDataset: PropTypes.string,
    }),
    setValues: PropTypes.func,
    handleWorkflowClick: PropTypes.func,
};

const IngestConfirmDisplay = ({selectedDataset, selectedWorkflow, inputs, handleRunWorkflow}) => {
    const projectsByID = useSelector(state => state.projects.itemsByID);

    const isSubmittingIngestionRun = useSelector(state => state.runs.isSubmittingIngestionRun);

    const formatWithNameIfPossible = (name, id) => name ? `${name} (${id})` : id;

    const [projectID, datasetID] = selectedDataset.split(":");

    const projectTitle = projectsByID[projectID]?.title || null;
    const datasetTitle = projectsByID[projectID]?.datasetsByID[datasetID]?.title || null;

    return (
        <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
            <Form.Item label="Project">
                {formatWithNameIfPossible(projectTitle, projectID)}
            </Form.Item>
            <Form.Item label="Dataset">
                {formatWithNameIfPossible(datasetTitle, datasetID)}
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
    selectedDataset: PropTypes.string,  // format: <project id>:<dataset id>
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
        workflowSelectionTitle="Dataset & Workflow"
        workflowSelectionDescription={
            <span style={{letterSpacing: "-0.1px"}}>Choose a dataset and ingestion workflow.</span>
        }
        confirmDisplay={({selectedWorkflow, workflowSelectionValues, inputs, handleRunWorkflow}) => (
            <IngestConfirmDisplay
                selectedDataset={workflowSelectionValues.selectedDataset}
                selectedWorkflow={selectedWorkflow}
                inputs={inputs}
                handleRunWorkflow={handleRunWorkflow}
            />
        )}
        onSubmit={({workflowSelectionValues, selectedWorkflow, inputs}) => {
            const {selectedDataset} = workflowSelectionValues;

            if (!selectedDataset || !selectedWorkflow) {
                message.error(`Missing ${selectedDataset ? "workflow" : "dataset"} selection; cannot submit run!`);
                return;
            }

            const serviceInfo = servicesByID[selectedWorkflow.serviceID];
            const [projectID, datasetID] = selectedDataset.split(":");

            dispatch(submitIngestionWorkflowRun(
                serviceInfo,
                projectID,
                datasetID,
                selectedWorkflow,
                inputs,
                "/admin/data/manager/runs",
                history,
            ));
        }}
    />;
};

export default ManagerIngestionContent;
