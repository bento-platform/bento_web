import React from "react";
import {useSelector} from "react-redux";

import {Layout, List, Skeleton, Spin, Tabs, Typography} from "antd";


import WorkflowListItem from "./WorkflowListItem";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {workflowsStateToPropsMixin} from "../../propTypes";

const workflowTypesToTitles = {
    ingestion: "Ingestion",
    analysis: "Analysis",
    export: "Export",
};

const ManagerWorkflowsContent = () => {
    // TODO: real key

    const {workflows, workflowsLoading} = useSelector(state => workflowsStateToPropsMixin(state));

    return <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Tabs defaultActiveKey="ingestion" type="card">
                {Object.entries(workflows)
                    .filter(([wt, _]) => wt in workflowTypesToTitles)
                    .map(([wt, items]) => (
                        <Tabs.TabPane tab={workflowTypesToTitles[wt]} key={wt}>
                            <Typography.Title level={2}>{workflowTypesToTitles[wt]} Workflows</Typography.Title>
                            <Spin spinning={workflowsLoading}>
                                {workflowsLoading
                                    ? <Skeleton />
                                    : <List itemLayout="vertical">
                                        {items.map(w => (
                                            <WorkflowListItem key={w.name} workflow={w} rightAlignedTags={true} />
                                        ))}
                                    </List>}
                            </Spin>
                        </Tabs.TabPane>
                    ))}
            </Tabs>
        </Layout.Content>
    </Layout>;
};

export default ManagerWorkflowsContent;
