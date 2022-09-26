import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Empty, Form, Layout, List, Skeleton, Spin, Steps, Table} from "antd";

import WorkflowListItem from "./WorkflowListItem";

import {submitIngestionWorkflowRun} from "../../modules/wes/actions";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL,

    STEP_WORKFLOW_SELECTION,
    STEP_CONFIRM,
} from "./ingestion";

import DatasetTreeSelect from "./DatasetTreeSelect";

import {EM_DASH, WORKFLOW_ACTION} from "../../constants";
import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {simpleDeepCopy} from "../../utils/misc";
import {withBasePath} from "../../utils/url";
import {
    workflowsStateToPropsMixin,
    workflowsStateToPropsMixinPropTypes
} from "../../propTypes";

class ManagerExportContent extends Component {
    constructor(props) {
        super(props);

        this.initialState = {
            step: STEP_WORKFLOW_SELECTION,
            selectedDataset: null,
            selectedWorkflow: null,
            initialInputValues: {},
            inputFormFields: {},
            inputs: {}
        };

        // TODO: Move selectedDataset to redux?

        this.state = {
            ...simpleDeepCopy(this.initialState),
            step: (this.props.location.state || {}).step || this.initialState.step,
            selectedDataset: (this.props.location.state || {}).selectedDataset || this.initialState.selectedDataset,
            selectedWorkflow: (this.props.location.state || {}).selectedWorkflow || this.initialState.selectedWorkflow,
            initialInputValues: (this.props.location.state || {}).initialInputValues
                || this.initialState.initialInputValues
        };

        this.handleStepChange = this.handleStepChange.bind(this);
        this.handleDatasetChange = this.handleDatasetChange.bind(this);
        this.handleWorkflowClick = this.handleWorkflowClick.bind(this);
        this.handleRunIngestion = this.handleRunIngestion.bind(this);
        this.getStepContents = this.getStepContents.bind(this);
    }

    handleStepChange(step) {
        this.setState({step});
    }

    handleDatasetChange(dataset) {
        this.setState({selectedDataset: dataset});
    }

    handleWorkflowClick(workflow) {
        const hiddenInputs = {
            ...Object.fromEntries(
                workflow.inputs
                    .filter(value => value?.hidden)
                    .map(i => [i.id, i.value])
            )
        }

        this.setState({
            step: STEP_CONFIRM,
            selectedWorkflow: workflow,
            initialInputValues: {},
            inputFormFields: {},
            inputs: {
                ...hiddenInputs,
                dataset_id: this.state.selectedDataset.split(":")[1]
            }
        });
    }

    handleRunIngestion(history) {
        if (!this.state.selectedDataset || !this.state.selectedWorkflow) {
            // TODO: GUI error message
            return;
        }

        const serviceInfo = this.props.servicesByID[this.state.selectedWorkflow.serviceID];
        const datasetID = this.state.selectedDataset.split(":")[2];

        this.props.submitIngestionWorkflowRun(serviceInfo, datasetID, this.state.selectedWorkflow,
            this.state.inputs, withBasePath("admin/data/manager/runs"), history);
    }

    getStepContents() {
        const formatWithNameIfPossible = (name, id) => name ? `${name} (${id})` : id;

        switch (this.state.step) {
            case STEP_WORKFLOW_SELECTION: {
                const workflows = this.props.workflows
                    .filter(w => w.action === WORKFLOW_ACTION.EXPORT)
                    .map(w => <WorkflowListItem key={w.id}
                                                workflow={w}
                                                selectable={true}
                                                onClick={() => this.handleWorkflowClick(w)} />);

                return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                    <Form.Item label="Dataset">
                        <DatasetTreeSelect onChange={dataset => this.handleDatasetChange(dataset)}
                                         value={this.state.selectedDataset}/>
                    </Form.Item>
                    <Form.Item label="Workflows">
                        {this.state.selectedDataset
                            ? <Spin spinning={this.props.workflowsLoading}>
                                {this.props.workflowsLoading
                                    ? <Skeleton/>
                                    : <List itemLayout="vertical">{workflows}</List>}
                            </Spin>
                            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                     description="Select a dataset to see available workflows"/>
                        }
                    </Form.Item>
                </Form>;
            }

            case STEP_CONFIRM: {
                const [object_type, dataset_id] = this.state.selectedDataset.split(":");
                const datasetTitle = this.props.datasetsByID[dataset_id]?.title ?? null;

                return (
                    <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                        <Form.Item label="Dataset">
                            {formatWithNameIfPossible(datasetTitle, dataset_id)}
                        </Form.Item>
                        <Form.Item label="Workflow">
                            <List itemLayout="vertical" style={{marginBottom: "14px"}}>
                                <WorkflowListItem workflow={this.state.selectedWorkflow}/>
                            </List>
                        </Form.Item>
                        <Form.Item label="Inputs">
                            <Table size="small" bordered={true} showHeader={false} pagination={false} columns={[
                                {
                                    title: "ID", dataIndex: "id", render: iID =>
                                        <span style={{fontWeight: "bold", marginRight: "0.5em"}}>{iID}</span>
                                },
                                {
                                    title: "Value", dataIndex: "value", render: value =>
                                        value === undefined
                                            ? EM_DASH
                                            : (value instanceof Array
                                                ? <ul>{value.map(v => <li key={v.toString()}>{v.toString()}</li>)}</ul>
                                                : value.toString()
                                            )
                                }
                            ]} rowKey="id" dataSource={this.state.selectedWorkflow.inputs.map(i =>
                                ({id: i.id, value: this.state.inputs[i.id]}))}/>
                        </Form.Item>
                        <Form.Item wrapperCol={FORM_BUTTON_COL}>
                            {/* TODO: Back button like the last one */}
                            <Button type="primary"
                                    style={{marginTop: "16px", float: "right"}}
                                    loading={this.props.isSubmittingIngestionRun}
                                    onClick={() => this.handleRunIngestion(this.props.history)}>
                                Run Export
                            </Button>
                        </Form.Item>
                    </Form>
                );
            }
        }
    }

    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Steps current={this.state.step} onChange={this.handleStepChange}>
                    <Steps.Step title="Dataset & Workflow"
                                description={<span style={{letterSpacing: "-0.1px"}}>
                                    Choose a dataset and export workflow.
                                </span>}>

                    </Steps.Step>
                    <Steps.Step title="Run" description="Confirm details and run the workflow."
                                disabled={this.state.step < STEP_CONFIRM && (this.state.selectedWorkflow === null ||
                                    Object.keys(this.state.inputs).length === 0)} />
                </Steps>
                <div style={{marginTop: "16px"}}>{this.getStepContents()}</div>
            </Layout.Content>
        </Layout>;
    }
}

ManagerExportContent.propTypes = {
    ...workflowsStateToPropsMixinPropTypes,
    servicesByID: PropTypes.object, // TODO: Shape
    projectsByID: PropTypes.object,  // TODO: Shape
    tablesByServiceID: PropTypes.object,  // TODO: Shape
    isSubmittingIngestionRun: PropTypes.bool,
};

const mapStateToProps = state => ({
    ...workflowsStateToPropsMixin(state),
    servicesByID: state.services.itemsByID,
    projectsByID: state.projects.itemsByID,
    datasetsByID: Object.fromEntries(
        Object.entries(state.projects.itemsByID).flatMap(([key, p]) => (
                p.datasets.map(d => [d.identifier, d])
             )
        )
    ),
    tablesByServiceID: state.serviceTables.itemsByServiceID,
    isSubmittingIngestionRun: state.runs.isSubmittingIngestionRun,
});

export default withRouter(connect(mapStateToProps, {
    submitIngestionWorkflowRun,
})(ManagerExportContent));
