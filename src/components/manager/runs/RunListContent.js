import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Table, Typography } from "antd";

import LastIngestionTable from "./RunLastContent";

import { fetchAllRunDetailsIfNeeded } from "@/modules/wes/actions";
import { useRuns } from "@/modules/wes/hooks";
import { RUN_REFRESH_TIMEOUT, RUN_TABLE_COLUMNS } from "./utils";

const RunListContent = () => {
  const dispatch = useDispatch();
  const runRefreshTimeout = useRef(null);

  const { items: runs } = useRuns();
  const mappedRuns = useMemo(
    () =>
      runs.map((r) => ({
        ...r,
        startTime: r.details?.run_log?.start_time,
        endTime: r.details?.run_log?.end_time,
      })),
    [runs],
  );

  const servicesFetching = useSelector((state) => state.services.isFetchingAll);
  const runsFetching = useSelector((state) => state.runs.isFetching);

  useEffect(() => {
    dispatch(fetchAllRunDetailsIfNeeded()).catch((err) => console.error(err));

    const _clearInterval = () => {
      if (runRefreshTimeout.current) {
        clearInterval(runRefreshTimeout.current);
      }
    };

    _clearInterval();

    runRefreshTimeout.current = setInterval(() => {
      dispatch(fetchAllRunDetailsIfNeeded()).catch((err) => {
        console.error(err);
        _clearInterval();
      });
    }, RUN_REFRESH_TIMEOUT);

    return _clearInterval;
  }, [dispatch]);

  // TODO: Loading for individual rows
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Latest Ingested Files
        </Typography.Title>
        <LastIngestionTable />
      </div>
      <div>
        <Typography.Title level={2}>Workflow Runs</Typography.Title>
        <Table
          bordered={true}
          size="middle"
          columns={RUN_TABLE_COLUMNS}
          dataSource={mappedRuns}
          loading={servicesFetching || runsFetching}
          rowKey="run_id"
        />
      </div>
    </div>
  );
};

export default RunListContent;
