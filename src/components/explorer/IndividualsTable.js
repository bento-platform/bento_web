import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withBasePath } from "../../utils/url";
import ExplorerSearchResultsTable from "./ExplorerSearchResultsTable";

const IndividualRender = ({individual}) => {
    const alternateIds = individual.alternate_ids ?? [];
    const listRender = alternateIds.length ? " (" + alternateIds.join(", ") + ")" : "";
    return (
        <>
            <Link
                to={(location) => ({
                    pathname: withBasePath(`data/explorer/individuals/${individual.id}/overview`),
                    state: { backUrl: location.pathname },
                })}
            >
                {individual.id}
            </Link>{" "}
            {listRender}
        </>
    );
};

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
        render: (samples) => (
            <>
                {samples.length} Sample{samples.length === 1 ? "" : "s"}
                {samples.length ? ": " : ""}
                {samples.join(", ")}
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

const IndividualsTable = ({ data }) => {
    return (
        <ExplorerSearchResultsTable
            dataStructure={SEARCH_RESULT_COLUMNS}
            data={data}
            activeTab="individuals"
        />
    );
};

IndividualsTable.propTypes = {
    data: PropTypes.array.isRequired,
};

export default IndividualsTable;