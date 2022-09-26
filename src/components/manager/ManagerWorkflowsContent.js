import React from "react";
import { useSelector } from "react-redux";

import { Layout, List, Skeleton, Spin, Typography } from "antd";

import WorkflowListItem from "./WorkflowListItem";

import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";
import { filterWorkflows } from "../../utils/workflow";

const ManagerWorkflowsContent = () => {
    const workflows = useSelector((state) => filterWorkflows(state.serviceWorkflows.workflowsByServiceID));
    const workflowsLoading = useSelector((state) => state.serviceWorkflows.isFetchingAll || state.services.isFetchingAll);

    // Create a map of workflows list items keyed by action type (e.g. "ingestion", "export"...)
    workflows.forEach((w) => {
        if (!workflows[w.action]) workflows[w.action] = []; // new list
        workflows[w.action].push(<WorkflowListItem key={w.name} workflow={w} />);
    });

    return (
        <>
            {Object.entries(workflows).map(([action, workflowsByAction], key) => (
                <Layout key={key}>
                    <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                        <Typography.Title level={2} style={{ textTransform: "capitalize" }}>
                            {action} Workflows
                        </Typography.Title>
                        <Spin spinning={workflowsLoading}>
                            {workflowsLoading ? <Skeleton /> : <List itemLayout="vertical">{workflowsByAction}</List>}
                        </Spin>
                    </Layout.Content>
                </Layout>
            ))}
        </>
    );
};

export default ManagerWorkflowsContent;
