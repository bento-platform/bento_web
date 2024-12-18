import { memo, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Skeleton } from "antd";
import PropTypes from "prop-types";

import { useAuthorizationHeader } from "bento-auth-js";
import { useService } from "@/modules/services/hooks";
import { useAppSelector } from "@/store";
import { useSortedColumns, useDynamicTableFilterOptions } from "../hooks/explorerHooks";

import BiosampleIDCell from "./BiosampleIDCell";
import IndividualIDCell from "./IndividualIDCell";
import { ExperimentDetail } from "../IndividualExperiments";
import ExplorerSearchResultsTable from "../ExplorerSearchResultsTable";
import { explorerIndividualUrl } from "../utils";

const ExperimentRender = memo(({ experimentId, individual }) => {
  const location = useLocation();
  return (
    <Link
      to={`${explorerIndividualUrl(individual.id)}/experiments/${experimentId}`}
      state={{ backUrl: location.pathname }}
    >
      {experimentId}
    </Link>
  );
});

ExperimentRender.propTypes = {
  experimentId: PropTypes.string.isRequired,
  individual: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

const ExperimentRowDetail = ({ experimentId }) => {
  const katsuUrl = useService("metadata")?.url;
  const authorizationHeader = useAuthorizationHeader();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!katsuUrl) return;
    fetch(`${katsuUrl}/api/experiments/${experimentId}`, { headers: authorizationHeader })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error);
  }, [katsuUrl, authorizationHeader, experimentId]);

  return (
    <div>
      <Skeleton active={true} loading={data === null} />
      {data ? <ExperimentDetail experiment={data} /> : null}
    </div>
  );
};
ExperimentRowDetail.propTypes = {
  experimentId: PropTypes.string.isRequired,
};

const ExperimentsTable = ({ data, datasetID }) => {
  const tableSortOrder = useAppSelector(
    (state) => state.explorer.tableSortOrderByDatasetID[datasetID]?.["experiments"],
  );

  const experimentTypeFilters = useDynamicTableFilterOptions(data, "experimentType");

  const columns = useMemo(
    () => [
      {
        title: "Experiment",
        dataIndex: "experimentId",
        render: (experimentId, record) => <ExperimentRender experimentId={experimentId} {...record} />,
        sorter: (a, b) => a.experimentId.localeCompare(b.experimentId),
        defaultSortOrder: "ascend",
      },
      {
        title: "Individual",
        dataIndex: "individual",
        render: (individual) => <IndividualIDCell individual={individual} />,
        sorter: (a, b) => a.individual.id.localeCompare(b.individual.id),
        sortDirections: ["descend", "ascend", "descend"],
      },
      {
        title: "Biosample",
        dataIndex: "biosampleId",
        render: (biosampleId, record) => (
          <BiosampleIDCell biosample={biosampleId} individualID={record.individual.id} />
        ),
        sorter: (a, b) => a.biosampleId.localeCompare(b.biosampleId),
        sortDirections: ["descend", "ascend", "descend"],
      },
      {
        title: "Study Type",
        dataIndex: "studyType",
        render: (studyType) => <>{studyType}</>,
        sorter: (a, b) => a.studyType.localeCompare(b.studyType),
        sortDirections: ["descend", "ascend", "descend"],
      },
      {
        title: "Experiment Type",
        dataIndex: "experimentType",
        render: (expType) => <>{expType}</>,
        sorter: (a, b) => a.experimentType.localeCompare(b.experimentType),
        sortDirections: ["descend", "ascend", "descend"],
        filters: experimentTypeFilters,
        onFilter: (value, record) => record.experimentType === value,
      },
    ],
    [experimentTypeFilters],
  );

  const { sortedData, columnsWithSortOrder } = useSortedColumns(data, tableSortOrder, columns);

  return (
    <ExplorerSearchResultsTable
      dataStructure={columns}
      data={sortedData}
      sortColumnKey={tableSortOrder?.sortColumnKey}
      sortOrder={tableSortOrder?.sortOrder}
      activeTab="experiments"
      columns={columnsWithSortOrder}
      currentPage={tableSortOrder?.currentPage}
      expandable={{
        expandedRowRender: (rec) => <ExperimentRowDetail experimentId={rec.experimentId} />,
      }}
    />
  );
};

ExperimentsTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      experimentId: PropTypes.string.isRequired,
      individual: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired,
      biosampleId: PropTypes.string.isRequired,
      studyType: PropTypes.string.isRequired,
      experimentType: PropTypes.string.isRequired,
    }),
  ).isRequired,
  datasetID: PropTypes.string.isRequired,
};

export default ExperimentsTable;
