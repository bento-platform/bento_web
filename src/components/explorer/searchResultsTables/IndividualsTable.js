import { Fragment, useEffect, useState } from "react";
import { Skeleton } from "antd";
import PropTypes from "prop-types";

import { useAuthorizationHeader } from "bento-auth-js";
import { useService } from "@/modules/services/hooks";
import { useAppSelector } from "@/store";
import { useSortedColumns } from "../hooks/explorerHooks";

import ExplorerSearchResultsTable from "../ExplorerSearchResultsTable";
import BiosampleIDCell from "./BiosampleIDCell";
import IndividualIDCell from "./IndividualIDCell";
import IndividualOverview from "../IndividualOverview";

const IndividualRowDetail = ({ individualId }) => {
  const katsuUrl = useService("metadata")?.url;
  const authorizationHeader = useAuthorizationHeader();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!katsuUrl) return;
    fetch(`${katsuUrl}/api/individuals/${individualId}`, { headers: authorizationHeader })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error);
  }, [katsuUrl, authorizationHeader, individualId]);

  return (
    <div>
      <Skeleton active={true} loading={data === null} />
      {data ? <IndividualOverview individual={data} /> : null}
    </div>
  );
};
IndividualRowDetail.propTypes = {
  individualId: PropTypes.string,
};

const SEARCH_RESULT_COLUMNS = [
  {
    title: "Individual",
    dataIndex: "individual",
    render: (individual) => <IndividualIDCell individual={individual} />,
    sorter: (a, b) => a.individual.id.localeCompare(b.individual.id),
    defaultSortOrder: "ascend",
  },
  {
    title: "Samples",
    dataIndex: "biosamples",
    render: (samples, { individual: { id: individualID } }) => (
      <>
        {samples.length} Sample{samples.length === 1 ? "" : "s"}
        {samples.length ? ": " : ""}
        {samples.map((s, si) => (
          <Fragment key={s}>
            <BiosampleIDCell biosample={s} individualID={individualID} />
            {si < samples.length - 1 ? ", " : ""}
          </Fragment>
        ))}
      </>
    ),
    sorter: (a, b) => a.biosamples.length - b.biosamples.length,
    sortDirections: ["descend", "ascend", "descend"],
  },
  {
    title: "Experiments",
    dataIndex: "experiments",
    render: (experiments) => (
      <>
        {experiments} Experiment{experiments === 1 ? "" : "s"}
      </>
    ),
    sorter: (a, b) => a.experiments - b.experiments,
    sortDirections: ["descend", "ascend", "descend"],
  },
];

const IndividualsTable = ({ data, datasetID }) => {
  const tableSortOrder = useAppSelector(
    (state) => state.explorer.tableSortOrderByDatasetID[datasetID]?.["individuals"],
  );

  const { sortedData, columnsWithSortOrder } = useSortedColumns(data, tableSortOrder, SEARCH_RESULT_COLUMNS);

  return (
    <ExplorerSearchResultsTable
      dataStructure={SEARCH_RESULT_COLUMNS}
      data={sortedData}
      sortColumnKey={tableSortOrder?.sortColumnKey}
      sortOrder={tableSortOrder?.sortOrder}
      activeTab="individuals"
      columns={columnsWithSortOrder}
      currentPage={tableSortOrder?.currentPage}
      expandable={{
        expandedRowRender: (rec) => <IndividualRowDetail individualId={rec.individual.id} />,
      }}
    />
  );
};

IndividualsTable.propTypes = {
  data: PropTypes.array.isRequired,
  datasetID: PropTypes.string.isRequired,
};

export default IndividualsTable;
