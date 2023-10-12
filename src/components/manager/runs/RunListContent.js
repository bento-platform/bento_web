import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Table, Typography } from "antd";

import LastIngestionTable from "./RunLastContent";

import { fetchAllRunDetailsIfNeeded } from "../../../modules/wes/actions";
import { RUN_REFRESH_TIMEOUT, RUN_TABLE_COLUMNS } from "./utils";

class RunListContent extends Component {
    constructor(props) {
        super(props);
        this.runRefreshTimeout = null;
        this.refreshRuns = this.refreshRuns.bind(this);
    }

    componentDidMount() {
        this.runRefreshTimeout = setTimeout(() => this.refreshRuns(), RUN_REFRESH_TIMEOUT);
    }

    componentWillUnmount() {
        if (this.runRefreshTimeout) clearTimeout(this.runRefreshTimeout);
    }

    async refreshRuns() {
        await this.props.fetchAllRunDetailsIfNeeded();
        this.runRefreshTimeout = setTimeout(() => this.refreshRuns(), RUN_REFRESH_TIMEOUT);
    }

    // TODO: Loading for individual rows
    render() {
        return (
            <div style={{display: "flex", flexDirection: "column", gap: 24}}>
                <div>
                    <Typography.Title level={2}>Latest Ingested Files</Typography.Title>
                    <LastIngestionTable />
                </div>
                <div>
                    <Typography.Title level={2}>Workflow Runs</Typography.Title>
                    <Table
                        size="middle"
                        bordered={true}
                        columns={RUN_TABLE_COLUMNS}
                        dataSource={this.props.runs}
                        loading={this.props.servicesFetching || this.props.runsFetching}
                        rowKey="run_id"
                    />
                </div>
            </div>
        );
    }
}

RunListContent.propTypes = {
    runs: PropTypes.arrayOf(PropTypes.object), // TODO: shape, incorporating additional props included below

    servicesFetching: PropTypes.bool,
    runsFetching: PropTypes.bool,

    fetchAllRunDetailsIfNeeded: PropTypes.func,
};

const mapStateToProps = (state) => ({
    runs: state.runs.items.map((r) => {
        const {
            name,
            start_time: startTime,
            end_time: endTime,
        } = state.runs.itemsByID[r.run_id]?.details?.run_log ?? {};
        return {
            ...r,
            purpose: "Ingestion", // TODO: Not hard-coded, Ingestion or Analysis
            name: name || "",
            startTime: startTime || "",
            endTime: endTime || "",
        };
    }),
    servicesFetching: state.services.isFetchingAll,
    runsFetching: state.runs.isFetching,
});

export default connect(mapStateToProps, {
    fetchAllRunDetailsIfNeeded,
})(RunListContent);
