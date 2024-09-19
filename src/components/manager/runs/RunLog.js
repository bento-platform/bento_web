import { useEffect } from "react";
import { useSelector } from "react-redux";

import { Descriptions } from "antd";

import MonospaceText from "@/components/common/MonospaceText";
import { fetchRunLogStreamsIfPossibleAndNeeded } from "@/modules/wes/actions";
import { runPropTypesShape } from "@/propTypes";
import { useAppDispatch } from "@/store";

import LogOutput from "./LogOutput";

const RunLog = ({ run }) => {
  const dispatch = useAppDispatch();

  const { isFetching: isFetchingRuns, streamsByID: runLogStreams } = useSelector((state) => state.runs);

  useEffect(() => {
    if (isFetchingRuns) return;
    dispatch(fetchRunLogStreamsIfPossibleAndNeeded(run.run_id));
  }, [dispatch, run, isFetchingRuns]);

  const stdout = runLogStreams[run.run_id]?.stdout ?? null;
  const stderr = runLogStreams[run.run_id]?.stderr ?? null;

  const runLog = run?.details?.run_log ?? {};

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
RunLog.propTypes = {
  run: runPropTypesShape,
};

export default RunLog;
