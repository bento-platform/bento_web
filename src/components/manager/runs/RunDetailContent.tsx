import { useCallback } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Result, Skeleton } from "antd";

import { useRuns } from "@/modules/wes/hooks";

import Run from "./Run";

const RunDetailContentInner = () => {
  const navigate = useNavigate();
  const { id, tab } = useParams();

  const { itemsByID: runsByID, isFetching, hasAttempted } = useRuns();

  const run = id ? runsByID[id] : undefined;
  const loading = isFetching || !!run?.isFetching;

  const onChangeTab = useCallback((key: string) => navigate(`../${key}`), [navigate]);
  const onBack = useCallback(() => navigate("/data/manager/runs"), [navigate]);

  return !run || loading ? (
    loading ? (
      <Skeleton active={true} />
    ) : hasAttempted ? (
      <Result
        status="error"
        title={`Could not find workflow with ID ${id}`}
        subTitle="Please ensure the specified ID is correct and that the WES service is running."
      />
    ) : null
  ) : (
    <Run run={run} tab={tab ?? "request"} onChangeTab={onChangeTab} onBack={onBack} />
  );
};

const RunDetailContent = () => (
  <Routes>
    <Route path=":tab" element={<RunDetailContentInner />} />
    <Route path="/" element={<Navigate to="request" replace={true} />} />
  </Routes>
);

export default RunDetailContent;
