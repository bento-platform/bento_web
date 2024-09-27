import { useEffect } from "react";

import { Descriptions } from "antd";

import MonospaceText from "@/components/common/MonospaceText";
import { fetchRunLogStreamsIfPossibleAndNeeded } from "@/modules/wes/actions";
import type { WorkflowRunStreamState } from "@/modules/wes/types";
import { useAppDispatch, useAppSelector } from "@/store";

import LogOutput from "./LogOutput";
import type { RunPageProps } from "./types";

const RunLog = ({ run }: RunPageProps) => {
  const dispatch = useAppDispatch();

  // TODO: when state is typed properly, don't need the type here
  const {
    isFetching: isFetchingRuns,
    streamsByID: runLogStreams,
  }: {
    isFetching: boolean;
    streamsByID: Record<
      string,
      {
        stdout: WorkflowRunStreamState;
        stderr: WorkflowRunStreamState;
      }
    >;
  } = useAppSelector((state) => state.runs);

  useEffect(() => {
    if (isFetchingRuns) return;
    dispatch(fetchRunLogStreamsIfPossibleAndNeeded(run.run_id));
  }, [dispatch, run, isFetchingRuns]);

  const stdout = runLogStreams[run.run_id]?.stdout;
  const stderr = runLogStreams[run.run_id]?.stderr;

  const runLog = run?.details?.run_log;

  if (!runLog) return <div />;

  return (
    <Descriptions bordered style={{ overflow: "auto" }}>
      <Descriptions.Item label="Command" span={3}>
        <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{runLog.cmd}</span>
      </Descriptions.Item>
      <Descriptions.Item label="Name" span={2}>
        {runLog.name}
      </Descriptions.Item>
      <Descriptions.Item label="Exit Code" span={1}>
        {runLog.exit_code === null ? "N/A" : runLog.exit_code}
      </Descriptions.Item>
      <Descriptions.Item label={<MonospaceText>stdout</MonospaceText>} span={3}>
        <LogOutput log={stdout} />
      </Descriptions.Item>
      <Descriptions.Item label={<MonospaceText>stderr</MonospaceText>} span={3}>
        <LogOutput log={stderr} />
      </Descriptions.Item>
    </Descriptions>
  );
};

export default RunLog;
