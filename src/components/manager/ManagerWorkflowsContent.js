import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, List, Skeleton, Spin, Typography} from "antd";


import WorkflowListItem from "./WorkflowListItem";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {workflowsStateToPropsMixin, workflowsStateToPropsMixinPropTypes} from "../../propTypes";

class ManagerWorkflowsContent extends Component {
    render() {
        // Create a map of workflows list items keyed by action type (e.g. "ingestion", "export"...)
        const workflows = {};
        this.props.workflows.forEach(w => {
            if (!workflows[w.action]) workflows[w.action] = []; // new list

            workflows[w.action].push(
                <WorkflowListItem key={w.name} workflow={w} />
            );
        });

        return <>
            { Object.entries(workflows).map(([action, workflowsByAction]) => (
                <Layout>
                    <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                        <Typography.Title level={2} style={{textTransform: "capitalize"}}>{action} Workflows</Typography.Title>
                        <Spin spinning={this.props.workflowsLoading}>
                            {this.props.workflowsLoading ? <Skeleton /> : <List itemLayout="vertical">{workflowsByAction}</List>}
                        </Spin>
                    </Layout.Content>
                </Layout>
            ))
            }
        </>;
    }
}

ManagerWorkflowsContent.propTypes = workflowsStateToPropsMixinPropTypes;

const mapStateToProps = state => ({...workflowsStateToPropsMixin(state)});

export default connect(mapStateToProps)(ManagerWorkflowsContent);
