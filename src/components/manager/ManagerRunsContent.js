import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, Table, Tag, Typography} from "antd";

import "antd/es/layout/style/css";
import "antd/es/tag/style/css";
import "antd/es/typography/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

const RUN_STATE_TAG_COLORS = {
    UNKNOWN: "",
    QUEUED: "blue",
    INITIALIZING: "cyan",
    RUNNING: "geekblue",
    PAUSED: "orange",
    COMPLETE: "green",
    EXECUTOR_ERROR: "red",
    SYSTEM_ERROR: "volcano",
    CANCELED: "magenta",
    CANCELING: "purple"
};

class ManagerRunsContent extends Component {
    render() {
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Typography.Title level={2}>Workflow Runs</Typography.Title>
                    <Table bordered={true} dataSource={this.props.runs}>
                        <Table.Column title="Run ID" dataIndex="run_id" />
                        <Table.Column title="Purpose" dataIndex="purpose" width={120} />
                        <Table.Column title="Name" dataIndex="name" />
                        <Table.Column title="Started" dataIndex="start_time" />
                        <Table.Column title="Ended" dataIndex="end_time" />
                        <Table.Column title="State" dataIndex="state" width={160}
                                      render={state => <Tag color={RUN_STATE_TAG_COLORS[state]}>{state}</Tag>} />
                    </Table>
                </Layout.Content>
            </Layout>
        );
    }
}

const mapStateToProps = state => ({
    runs: state.runs.items.map(r => ({
        ...r,
        purpose: "Ingestion",  // TODO: Not hard-coded, Ingestion or Analysis
        name: (state.runs.itemDetails[r.run_log] || {run_log: {name: ""}}).name || "",
        start_time: (state.runs.itemDetails[r.run_log] || {run_log: {start_time: ""}}).start_time || "",
        end_time: (state.runs.itemDetails[r.run_log] || {run_log: {end_time: ""}}).end_time || ""
    }))
});

export default connect(mapStateToProps)(ManagerRunsContent);
