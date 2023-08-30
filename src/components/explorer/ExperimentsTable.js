import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useSortedColumns } from "./hooks/explorerHooks";
import ExplorerSearchResultsTable from "./ExplorerSearchResultsTable";

const ExperimentRender = React.memo(({ experimentId, individual }) => {
    const location = useLocation();
    return (
        <>
            <Link
                to={{
                    pathname: `/data/explorer/individuals/${individual.id}/experiments`,
                    hash: "#" + experimentId,
                    state: { backUrl: location.pathname },
                }}
            >
                {experimentId}
            </Link>
        </>
    );
});

ExperimentRender.propTypes = {
    experimentId: PropTypes.string.isRequired,
    individual: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
};

const SEARCH_RESULT_COLUMNS_EXP = [
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
        render: (individual) => <>{individual.id}</>,
        sorter: (a, b) => a.individual.id.localeCompare(b.individual.id),
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Biosample",
        dataIndex: "biosampleId",
        render: (bioType) => <>{bioType}</>,
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
    },
];

const ExperimentsTable = ({ data, datasetID }) => {
    const tableSortOrder = useSelector(
        (state) => state.explorer.tableSortOrderByDatasetID[datasetID]?.["experiments"],
    );

    const { sortedData, columnsWithSortOrder } = useSortedColumns(
        data,
        tableSortOrder,
        SEARCH_RESULT_COLUMNS_EXP,
    );
    return (
        <ExplorerSearchResultsTable
            dataStructure={SEARCH_RESULT_COLUMNS_EXP}
            data={sortedData}
            sortColumnKey={tableSortOrder?.sortColumnKey}
            sortOrder={tableSortOrder?.sortOrder}
            activeTab="experiments"
            columns={columnsWithSortOrder}
            currentPage={tableSortOrder?.currentPage}
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
