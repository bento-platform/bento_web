import type { ReactNode } from "react";
import { memo } from "react";

import { Flex, Statistic, Tabs, Tag } from "antd";
import { PageHeader } from "@ant-design/pro-components";

import MonospaceText from "@/components/common/MonospaceText";
import type { WorkflowRunWithNestedDetailsState } from "@/modules/wes/types";
import { nop } from "@/utils/misc";

import RunRequest from "./RunRequest";
import RunLog from "./RunLog";
import RunTaskLogs from "./RunTaskLogs";
import RunOutputs from "./RunOutputs";
import type { RunPageProps } from "./types";
import { renderDate, RUN_STATE_TAG_COLORS } from "./utils";

const TABS: Record<string, ({ run }: RunPageProps) => ReactNode> = {
  request: RunRequest,
  run_log: RunLog,
  task_logs: RunTaskLogs,
  outputs: RunOutputs,
};

type RunProps = {
  run: WorkflowRunWithNestedDetailsState;
  tab: string;
  onChangeTab: (tab: string) => void;
  onBack: () => void;
};

const Run = memo(({ run, tab, onChangeTab, onBack }: RunProps) => {
  const currentTab = tab ?? "request";

  const runLog = run.details?.run_log;
  const endTime = runLog?.end_time;

  const tabItems = [
    // Don't need to memoize this; the memo() wrapper should take care of it
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
            disabled: !endTime || Object.keys(run.details?.outputs ?? {}).length === 0,
          },
        ]
      : []),
  ];

  const Content = TABS[tab];

  return (
    <>
      <PageHeader
        title={
          <>
            Run <MonospaceText>{run.run_id}</MonospaceText>
          </>
        }
        tags={<Tag color={RUN_STATE_TAG_COLORS[run.state]}>{run.state}</Tag>}
        style={{ padding: 0 }}
        footer={<Tabs activeKey={currentTab} onChange={onChangeTab || nop} items={tabItems} />}
        onBack={onBack || nop}
      >
        <Flex>
          <Statistic title="Started" value={renderDate(runLog?.start_time) || "N/A"} />
          <Statistic title="Ended" value={renderDate(endTime) || "N/A"} style={{ marginLeft: "24px" }} />
        </Flex>
      </PageHeader>
      <Content run={run} />
    </>
  );
});

export default Run;
