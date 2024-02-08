import React, { memo } from "react";
import PropTypes from "prop-types";

import {PageHeader, Row, Statistic, Tabs, Tag} from "antd";

import RunRequest from "./RunRequest";
import RunLog from "./RunLog";
import RunTaskLogs from "./RunTaskLogs";

import {renderDate, RUN_STATE_TAG_COLORS} from "./utils";
import {nop} from "../../../utils/misc";
import {runPropTypesShape} from "../../../propTypes";


const TAB_ITEMS = [
    { key: "request", label: "Request" },
    { key: "run_log", label: "Run Log" },
    /*<Tabs.TabPane tab="Task Logs" key="task_logs" /> TODO: Implement in WES */
];
const TABS = {
    "request": RunRequest,
    "run_log": RunLog,
    "task_logs": RunTaskLogs,
};


const Run = memo(({ run: runOrUndefined, tab, onChangeTab, onBack }) => {
    const run = runOrUndefined ?? {};
    const currentTab = tab ?? "request";

    const Content = TABS[tab];

    return (
        <>
            <PageHeader title={<>Run <span style={{fontFamily: "monospace"}}>{run.run_id}</span></>}
                        tags={<Tag color={RUN_STATE_TAG_COLORS[run.state]}>{run.state}</Tag>}
                        style={{padding: 0}}
                        footer={<Tabs activeKey={currentTab} onChange={onChangeTab || nop} items={TAB_ITEMS} />}
                        onBack={onBack || nop}>
                <Row type="flex">
                    <Statistic title="Started" value={renderDate(run.details.run_log.start_time) || "N/A"} />
                    <Statistic title="Ended" value={renderDate(run.details.run_log.end_time) || "N/A"}
                               style={{marginLeft: "24px"}} />
                </Row>
            </PageHeader>
            <div style={{margin: "24px 0 16px 0"}}>
                <Content run={run} />
            </div>
        </>
    );
});

Run.propTypes = {
    tab: PropTypes.oneOf(["request", "run_log", "task_logs"]),
    run: runPropTypesShape,
    onBack: PropTypes.func,
    onChangeTab: PropTypes.func,
};

export default Run;
