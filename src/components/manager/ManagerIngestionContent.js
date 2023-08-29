import React, {useCallback} from "react";
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

import {workflowTarget, workflowsStateToPropsMixin} from "../../propTypes";
import RunSetupWizard from "./RunSetupWizard";
import RunSetupInputsTable from "./RunSetupInputsTable";
import DataTypeSelect from "./DataTypeSelect";


const IngestWorkflowSelection = ({values, setValues, handleWorkflowClick}) => {
    const {workflows, workflowsLoading} = useSelector(workflowsStateToPropsMixin);
    const {selectedProject, selectedDataset, selectedDataType} = values;

    const workflowItems = workflows.ingestion
        .filter(w => selectedDataset && selectedDataType && w.data_type === selectedDataType)
        .map(w =>
            <WorkflowListItem
                key={w.id}
                workflow={w}
                onClick={() => handleWorkflowClick(w)}
            />,
        );

    const onChange = useCallback(({
        project = selectedProject,
        dataset = selectedDataset,
        dataType = selectedDataType,
    }) => {
        setValues({
            selectedProject: project,
            selectedDataset: dataset,
            selectedDataType: dataType,
        });
    }, [selectedDataset, selectedDataType, setValues]);

    return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
        <Form.Item label="Dataset">
            <DatasetTreeSelect
                onChange={(p, d) => onChange({project: p, dataset: d})}
                value={selectedDataset}
            />
        </Form.Item>
        <Form.Item label="Data Type">
            <DataTypeSelect
                workflows={workflows?.ingestion ?? []}
                onChange={dt => onChange({dataType: dt})}
                value={selectedDataType}
            />
        </Form.Item>
        <Form.Item label="Workflows">
            {selectedDataset && selectedDataType
                ? <Spin spinning={workflowsLoading}>
                    {workflowsLoading
                        ? <Skeleton/>
                        : <List itemLayout="vertical">{workflowItems}</List>}
                </Spin>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                         description="Select a dataset and data type to see available workflows"/>
            }
        </Form.Item>
    </Form>;
};
IngestWorkflowSelection.propTypes = {
    values: workflowTarget,
    setValues: PropTypes.func,
    handleWorkflowClick: PropTypes.func,
};

const TitleAndID = React.memo(({title, id}) => title ? <span>{title} ({id})</span> : <span>{id}</span>);
TitleAndID.propTypes = {
    title: PropTypes.string,
    id: PropTypes.string,
};

const STYLE_RUN_INGESTION = {marginTop: "16px", float: "right"};

const IngestConfirmDisplay = ({target, selectedWorkflow, inputs, handleRunWorkflow}) => {
    const projectsByID = useSelector(state => state.projects.itemsByID);
    const isSubmittingIngestionRun = useSelector(state => state.runs.isSubmittingIngestionRun);
    const datasetsByID = useSelector((state) => state.projects.datasetsByID);

    const {selectedProject, selectedDataset} = target;

    const projectTitle = projectsByID[selectedProject]?.title || null;
    const datasetTitle = datasetsByID[selectedDataset]?.title || null;

    return (
        <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
            <Form.Item label="Project">
                <TitleAndID title={projectTitle} id={selectedProject} />
            </Form.Item>
            <Form.Item label="Dataset">
                <TitleAndID title={datasetTitle} id={selectedDataset} />
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
                        style={STYLE_RUN_INGESTION}
                        loading={isSubmittingIngestionRun}
                        onClick={handleRunWorkflow}>
                    Run Ingestion
                </Button>
            </Form.Item>
        </Form>
    );
};
IngestConfirmDisplay.propTypes = {
    target: workflowTarget,
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
                // selectedDataset={workflowSelectionValues.selectedDataset}
                target={workflowSelectionValues}
                selectedWorkflow={selectedWorkflow}
                inputs={inputs}
                handleRunWorkflow={handleRunWorkflow}
            />
        )}
        onSubmit={({workflowSelectionValues, selectedWorkflow, inputs}) => {
            const {selectedProject, selectedDataset, selectedDataType} = workflowSelectionValues;

            if (!selectedDataset || !selectedWorkflow) {
                message.error(`Missing ${selectedDataset ? "workflow" : "dataset"} selection; cannot submit run!`);
                return;
            }

            const serviceInfo = servicesByID[selectedWorkflow.serviceID];

            dispatch(submitIngestionWorkflowRun(
                serviceInfo,
                selectedProject,
                selectedDataset,
                selectedDataType,
                selectedWorkflow,
                inputs,
                "/admin/data/manager/runs",
                history,
            ));
        }}
    />;
};

export default ManagerIngestionContent;
