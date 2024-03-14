import React, { memo } from "react";
import PropTypes from "prop-types";

import { PageHeader, Row, Statistic, Tabs, Tag } from "antd";

import RunRequest from "./RunRequest";
import RunLog from "./RunLog";
import RunTaskLogs from "./RunTaskLogs";
import RunOutputs from "./RunOutputs";

import { renderDate, RUN_STATE_TAG_COLORS } from "./utils";
import { runPropTypesShape } from "@/propTypes";
import { nop } from "@/utils/misc";


const TABS = {
    "request": RunRequest,
    "run_log": RunLog,
    "task_logs": RunTaskLogs,
    "outputs": RunOutputs,
};


const Run = memo(({ run: runOrUndefined, tab, onChangeTab, onBack }) => {
    const run = runOrUndefined ?? {};
    const currentTab = tab ?? "request";

    const runLog = run.details?.run_log ?? {};
    const endTime = runLog.end_time;

    const tabItems = [  // Don't need to memoize this; the React.memo() wrapper should take care of it
        { key: "request", label: "Request" },
        { key: "run_log", label: "Run Log" },
        /* { key: "task_logs", label: "Task Logs" }, TODO: Implement in WES */

        // This is not part of the WES standard, so don't even render the tab if the key doesn't exist
        ...(run.details?.outputs
            ? [
                {
                    key: "outputs",
                    label: "Outputs",
                    // If we have the outputs key, but there aren't any outputs or the workflow isn't finished yet,
                    // leave the tab disabled:
                    disabled: !endTime || (run.details?.outputs ?? {}).length === 0,
                },
            ] : []),
    ];

    const Content = TABS[tab];

    return (
        <>
            <PageHeader title={<>Run <span style={{fontFamily: "monospace"}}>{run.run_id}</span></>}
                        tags={<Tag color={RUN_STATE_TAG_COLORS[run.state]}>{run.state}</Tag>}
                        style={{padding: 0}}
                        footer={<Tabs activeKey={currentTab} onChange={onChangeTab || nop} items={tabItems} />}
                        onBack={onBack || nop}>
                <Row type="flex">
                    <Statistic title="Started" value={renderDate(runLog.start_time) || "N/A"} />
                    <Statistic title="Ended" value={renderDate(endTime) || "N/A"} style={{marginLeft: "24px"}} />
                </Row>
            </PageHeader>
            <div style={{margin: "24px 0 16px 0"}}>
                <Content run={run} />
            </div>
        </>
    );
});

Run.propTypes = {
    tab: PropTypes.oneOf(["request", "run_log", "task_logs", "outputs"]),
    run: runPropTypesShape,
    onBack: PropTypes.func,
    onChangeTab: PropTypes.func,
};

export default Run;
