import React from "react";
import {Link} from "react-router-dom";

import {Tag} from "antd";

import {withBasePath} from "../../../utils/url";


export const RUN_REFRESH_TIMEOUT = 7500;


export const renderDate = date => date === "" ? "" : new Date(Date.parse(date)).toLocaleString("en-CA");

export const sortDate = (a, b, dateProperty) =>
    (new Date(Date.parse(a[dateProperty])).getTime() || Infinity) -
    (new Date(Date.parse(b[dateProperty])).getTime() || Infinity);

// If end times are unset, sort by start times
const sortEndDate = (a, b) =>
    sortDate(a, b, (!a.startTime || !b.endTime) ? "startTime" : "endTime");

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
    CANCELING: "purple"
};

export const RUN_TABLE_COLUMNS = [
    {
        title: "Run ID",
        dataIndex: "run_id",
        sorter: (a, b) => a.run_id.localeCompare(b.run_id),
        render: runID => <Link to={withBasePath(`admin/data/manager/runs/${runID}`)}
                               style={{fontFamily: "monospace"}}>{runID}</Link>
    },
    {
        title: "Purpose",
        dataIndex: "purpose",
        width: 120,
        sorter: (a, b) => a.purpose.localeCompare(b.purpose),
    },
    {
        title: "Name",
        dataIndex: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
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
    }
];
