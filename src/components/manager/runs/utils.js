import React from "react";
import {Link} from "react-router-dom";

import {Tag} from "antd";


export const RUN_REFRESH_TIMEOUT = 7500;


export const renderDate = date => date ? new Date(Date.parse(date)).toLocaleString("en-CA") : "";

export const sortDate = (a, b, dateProperty, bDateProperty=undefined) =>
    (new Date(Date.parse(a[dateProperty])).getTime() || Infinity) -
    (new Date(Date.parse(b[bDateProperty ?? dateProperty])).getTime() || Infinity);

// If end times are unset, sort by start times
const sortEndDate = (a, b) => {
    let prop = "endTime";
    let bProp = undefined;
    if (!a.endTime && !b.endTime) {
        // If neither workflow has an end time, sort by start time instead
        prop = "startTime";
    } else if (!a.startTime && !b.endTime) {
        // If 'a' has no start time (i.e., it crashed right away), use a.startTime as a.endTime
        prop = "startTime";
        bProp = "endTime";
    } else if (!a.endTime && b.startTime) {
        // Switched version of above case
        prop = "endTime";
        bProp = "startTime";
    }
    return sortDate(a, b, prop, bProp);
};

export const RUN_STATE_TAG_COLORS = {
    UNKNOWN: "",
    QUEUED: "blue",
    INITIALIZING: "cyan",
    RUNNING: "geekblue",
    PAUSED: "orange",
    COMPLETE: "green",
    EXECUTOR_ERROR: "red",
    SYSTEM_ERROR: "volcano",
    CANCELED: "magenta",
    CANCELING: "purple",
};

const runName = (w) => w.details?.run_log?.name ?? "";
const runType = (w) => w.details?.request?.tags?.workflow_metadata?.type ?? "";

export const RUN_TABLE_COLUMNS = [
    {
        title: "Run ID",
        dataIndex: "run_id",
        sorter: (a, b) => a.run_id.localeCompare(b.run_id),
        render: runID => <Link to={`/admin/data/manager/runs/${runID}`}
                               style={{fontFamily: "monospace"}}>{runID}</Link>,
    },
    {
        title: "Purpose",
        dataIndex: "details.request.tags.workflow_metadata.type",
        width: 120,
        sorter: (a, b) => runType(a).localeCompare(runType(b)),
    },
    {
        title: "Name",
        dataIndex: "details.run_log.name",
        sorter: (a, b) => runName(a).localeCompare(runName(b)),
    },
    {
        title: "Started",
        dataIndex: "startTime",
        width: 205,
        render: renderDate,
        sorter: (a, b) => sortDate(a, b, "startTime"),
    },
    {
        title: "Ended",
        dataIndex: "endTime",
        width: 205,
        render: renderDate,
        sorter: sortEndDate,
        defaultSortOrder: "descend",
    },
    {
        title: "State",
        dataIndex: "state",
        width: 150,
        render: state => <Tag color={RUN_STATE_TAG_COLORS[state]}>{state}</Tag>,
        sorter: (a, b) => a.state.localeCompare(b.state),
    },
];
