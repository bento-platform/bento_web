import React from "react";
import PropTypes from "prop-types";
import { useSortedColumns } from "../hooks/explorerHooks";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ExplorerSearchResultsTable from "../ExplorerSearchResultsTable";
import BiosampleIDCell from "./BiosampleIDCell";

const IndividualRender = React.memo(({individual: {id, alternate_ids: alternateIds}}) => {
    const location = useLocation();
    const alternateIdsRender = alternateIds?.length ? " (" + alternateIds.join(", ") + ")" : "";
    return (
        <>
            <Link
                to={{
                    pathname: `/data/explorer/individuals/${id}/overview`,
                    state: { backUrl: location.pathname },
                }}
            >
                {id}
            </Link>{" "}
            {alternateIdsRender}
        </>
    );
});

IndividualRender.propTypes = {
    individual: PropTypes.object.isRequired,
};

const SEARCH_RESULT_COLUMNS = [
    {
        title: "Individual",
        dataIndex: "individual",
        render: (individual) => <IndividualRender individual={individual} />,
        sorter: (a, b) => a.individual.id.localeCompare(b.individual.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Samples",
        dataIndex: "biosamples",
        render: (samples, {individual: {id: individualId}}) => (
            <>
                {samples.length} Sample{samples.length === 1 ? "" : "s"}
                {samples.length ? ": " : ""}
                {samples.map((s, si) => <>
                    <BiosampleIDCell biosample={s} individualId={individualId} />
                    {si < samples.length - 1 ? ", " : ""}
                </>)}
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
    const tableSortOrder = useSelector(
        (state) => state.explorer.tableSortOrderByDatasetID[datasetID]?.["individuals"],
    );

    const { sortedData, columnsWithSortOrder } = useSortedColumns(
        data,
        tableSortOrder,
        SEARCH_RESULT_COLUMNS,
    );

    return (
        <ExplorerSearchResultsTable
            dataStructure={SEARCH_RESULT_COLUMNS}
            data={sortedData}
            sortColumnKey={tableSortOrder?.sortColumnKey}
            sortOrder={tableSortOrder?.sortOrder}
            activeTab="individuals"
            columns={columnsWithSortOrder}
            currentPage={tableSortOrder?.currentPage}
        />
    );
};

IndividualsTable.propTypes = {
    data: PropTypes.array.isRequired,
    datasetID: PropTypes.string.isRequired,
};

export default IndividualsTable;
