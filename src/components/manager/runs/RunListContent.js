import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Table, Typography} from "antd";


import {fetchAllRunDetailsIfNeeded} from "../../../modules/wes/actions";

import {RUN_REFRESH_TIMEOUT, RUN_TABLE_COLUMNS} from "./utils";


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
        return <>
            <Typography.Title level={2}>Workflow Runs</Typography.Title>
            <Table bordered={true}
                   columns={RUN_TABLE_COLUMNS}
                   dataSource={this.props.runs}
                   loading={this.props.servicesFetching || this.props.runsFetching}
                   rowKey="run_id" />
        </>;
    }
}

RunListContent.propTypes = {
    runs: PropTypes.arrayOf(PropTypes.object),  // TODO: shape, incorporating additional props included below

    servicesFetching: PropTypes.bool,
    runsFetching: PropTypes.bool,

    fetchAllRunDetailsIfNeeded: PropTypes.func,
};

const mapStateToProps = state => ({
    runs: state.runs.items.map(r => {
        const runDetails = (state.runs.itemsByID[r.run_id] || {details: null}).details;
        return {
            ...r,
            purpose: runDetails?.request.tags.workflow_metadata.action ?? "Ingestion",
            name: (runDetails || {run_log: {name: ""}}).run_log.name || "",
            start_time: (runDetails || {run_log: {start_time: ""}}).run_log.start_time || "",
            end_time: (runDetails || {run_log: {end_time: ""}}).run_log.end_time || ""
        };
    }),
    servicesFetching: state.services.isFetchingAll,
    runsFetching: state.runs.isFetching,
});

export default connect(mapStateToProps, {
    fetchAllRunDetailsIfNeeded,
})(RunListContent);
