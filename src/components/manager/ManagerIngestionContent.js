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

// class ManagerIngestionContent_ extends Component {
//     constructor(props) {
//         super(props);
//
//         this.initialState = {
//             step: STEP_WORKFLOW_SELECTION,
//             selectedTable: null,
//             selectedWorkflow: null,
//             initialInputValues: {},
//             inputFormFields: {},
//             inputs: {}
//         };
//
//         // TODO: Move selectedTable to redux?
//
//         this.state = {
//             ...simpleDeepCopy(this.initialState),
//             step: (this.props.location.state || {}).step || this.initialState.step,
//             selectedTable: (this.props.location.state || {}).selectedTable || this.initialState.selectedTable,
//             selectedWorkflow: (this.props.location.state || {}).selectedWorkflow || this.initialState.selectedWorkflow,
//             initialInputValues: (this.props.location.state || {}).initialInputValues
//                 || this.initialState.initialInputValues,
//         };
//
//         this.handleStepChange = this.handleStepChange.bind(this);
//         this.handleWorkflowClick = this.handleWorkflowClick.bind(this);
//         this.handleInputSubmit = this.handleInputSubmit.bind(this);
//         this.handleRunIngestion = this.handleRunIngestion.bind(this);
//         this.getStepContents = this.getStepContents.bind(this);
//     }
//
//     handleStepChange(step) {
//         this.setState({step});
//     }
//
//     handleWorkflowClick(workflow) {
//         this.setState({
//             step: STEP_INPUT,
//             selectedWorkflow: workflow,
//             initialInputValues: {},
//             inputFormFields: {},
//             inputs: {}
//         });
//     }
//
//     handleInputSubmit(inputs) {
//         this.setState({
//             inputs,
//             step: STEP_CONFIRM
//         });
//     }
//
//     handleRunIngestion(history) {
//         if (!this.state.selectedTable || !this.state.selectedWorkflow) {
//             // TODO: GUI error message
//             return;
//         }
//
//         const serviceInfo = this.props.servicesByID[this.state.selectedWorkflow.serviceID];
//         const tableID = this.state.selectedTable.split(":")[2];
//
//         this.props.submitIngestionWorkflowRun(serviceInfo, tableID, this.state.selectedWorkflow,
//             this.state.inputs, withBasePath("admin/data/manager/runs"), history);
//     }
//
//     getStepContents() {
//         const getTableName = (serviceID, tableID) =>
//             (((this.props.tablesByServiceID[serviceID] || {}).tablesByID || {})[tableID] || {}).name;
//
//         const formatWithNameIfPossible = (name, id) => name ? `${name} (${id})` : id;
//
//         switch (this.state.step) {
//             case STEP_WORKFLOW_SELECTION: {
//                 const workflows = this.props.workflows.ingestion
//                     .filter(w => w.data_type === (this.state.selectedTable
//                         ? this.state.selectedTable.split(":")[1] : null))
//                     .map(w => <WorkflowListItem key={w.id}
//                                                 workflow={w}
//                                                 selectable={true}
//                                                 onClick={() => this.handleWorkflowClick(w)} />);
//
//                 return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
//                     <Form.Item label="Table">
//                         <TableTreeSelect onChange={table => this.setState({selectedTable: table})}
//                                          value={this.state.selectedTable}/>
//                     </Form.Item>
//                     <Form.Item label="Workflows">
//                         {this.state.selectedTable
//                             ? <Spin spinning={this.props.workflowsLoading}>
//                                 {this.props.workflowsLoading
//                                     ? <Skeleton/>
//                                     : <List itemLayout="vertical">{workflows}</List>}
//                             </Spin>
//                             : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
//                                      description="Select a table to see available workflows"/>
//                         }
//                     </Form.Item>
//                 </Form>;
//             }
//
//             case STEP_INPUT:
//                 return <RunSetupInputForm
//                     workflow={this.state.selectedWorkflow}
//                     tree={this.props.tree}
//                     initialValues={this.state.initialInputValues}
//                     formValues={this.state.inputFormFields}
//                     onChange={formValues => this.setState({inputFormFields: formValues})}
//                     onSubmit={this.handleInputSubmit}
//                     onBack={() => this.handleStepChange(0)}
//                 />;
//
//             case STEP_CONFIRM: {
//                 const [projectID, dataType, tableID] = this.state.selectedTable.split(":");
//                 const projectTitle = (this.props.projectsByID[projectID] || {title: null}).title || null;
//                 const tableName = getTableName(this.state.selectedWorkflow.serviceID, tableID);
//
//                 return (
//                     <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
//                         <Form.Item label="Project">
//                             {formatWithNameIfPossible(projectTitle, projectID)}
//                         </Form.Item>
//                         <Form.Item label="Data Type">
//                             <Tag>{dataType}</Tag>
//                         </Form.Item>
//                         <Form.Item label="Table">
//                             {formatWithNameIfPossible(tableName, tableID)}
//                         </Form.Item>
//                         <Form.Item label="Workflow">
//                             <List itemLayout="vertical" style={{marginBottom: "14px"}}>
//                                 <WorkflowListItem workflow={this.state.selectedWorkflow}/>
//                             </List>
//                         </Form.Item>
//                         <Form.Item label="Inputs">
//                             <Table size="small" bordered={true} showHeader={false} pagination={false} columns={[
//                                 {
//                                     title: "ID", dataIndex: "id", render: iID =>
//                                         <span style={{fontWeight: "bold", marginRight: "0.5em"}}>{iID}</span>
//                                 },
//                                 {
//                                     title: "Value", dataIndex: "value", render: value =>
//                                         value === undefined
//                                             ? EM_DASH
//                                             : (value instanceof Array
//                                                 ? <ul>{value.map(v => <li key={v.toString()}>{v.toString()}</li>)}</ul>
//                                                 : value.toString()
//                                             )
//                                 }
//                             ]} rowKey="id" dataSource={this.state.selectedWorkflow.inputs.map(i =>
//                                 ({id: i.id, value: this.state.inputs[i.id]}))}/>
//                         </Form.Item>
//                         <Form.Item wrapperCol={FORM_BUTTON_COL}>
//                             {/* TODO: Back button like the last one */}
//                             <Button type="primary"
//                                     style={{marginTop: "16px", float: "right"}}
//                                     loading={this.props.isSubmittingIngestionRun}
//                                     onClick={() => this.handleRunIngestion(this.props.history)}>
//                                 Run Ingestion
//                             </Button>
//                         </Form.Item>
//                     </Form>
//                 );
//             }
//         }
//     }
//
//     render() {
//         return <Layout>
//             <Layout.Content style={LAYOUT_CONTENT_STYLE}>
//                 <Steps current={this.state.step} onChange={this.handleStepChange}>
//                     <Steps.Step title="Table & Workflow"
//                                 description={<span style={{letterSpacing: "-0.1px"}}>
//                                     Choose a table and ingestion workflow.
//                                 </span>}>
//
//                     </Steps.Step>
//                     <Steps.Step title="Input"
//                                 description="Select input data for the workflow."
//                                 disabled={this.state.step < STEP_INPUT &&
//                                     Object.keys(this.state.inputs).length === 0} />
//                     <Steps.Step title="Run" description="Confirm details and run the workflow."
//                                 disabled={this.state.step < STEP_CONFIRM && (this.state.selectedWorkflow === null ||
//                                     Object.keys(this.state.inputs).length === 0)} />
//                 </Steps>
//                 <div style={{marginTop: "16px"}}>{this.getStepContents()}</div>
//             </Layout.Content>
//         </Layout>;
//     }
// }

// ManagerIngestionContent.propTypes = {
//     // ...dropBoxTreeStateToPropsMixinPropTypes,
//     // ...workflowsStateToPropsMixinPropTypes,
//     // servicesByID: PropTypes.object, // TODO: Shape
//     // projectsByID: PropTypes.object,  // TODO: Shape
//     // tablesByServiceID: PropTypes.object,  // TODO: Shape
//     // isSubmittingIngestionRun: PropTypes.bool,
// };

export default ManagerIngestionContent;
