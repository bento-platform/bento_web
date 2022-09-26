import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, List, Skeleton, Spin, Typography} from "antd";


import WorkflowListItem from "./WorkflowListItem";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {workflowsStateToPropsMixin, workflowsStateToPropsMixinPropTypes} from "../../propTypes";

class ManagerWorkflowsContent extends Component {
    render() {
        // TODO: real key
        const workflows = this.props.workflows.map(w => <WorkflowListItem key={w.name} workflow={w} />);
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={2}>Ingestion Workflows</Typography.Title>
                <Spin spinning={this.props.workflowsLoading}>
                    {this.props.workflowsLoading ? <Skeleton /> : <List itemLayout="vertical">{workflows}</List>}
                </Spin>
            </Layout.Content>
        </Layout>;
    }
}

ManagerWorkflowsContent.propTypes = workflowsStateToPropsMixinPropTypes;

const mapStateToProps = state => ({...workflowsStateToPropsMixin(state)});

export default connect(mapStateToProps)(ManagerWorkflowsContent);