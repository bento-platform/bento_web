import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import React from "react";
import { withBasePath } from "../../utils/url";
import ExplorerSearchResultsTableComp from "./ExplorerSearchResultsTableComp";

const experimentRender = (individual, record) => {
    const alternateIds = individual.alternate_ids ?? [];
    const listRender = alternateIds.length ? " (" + alternateIds.join(", ") + ")" : "";
    return (
        <>
            <Link
                to={{
                    pathname: withBasePath(`data/explorer/individuals/${record.individual.id}/experiments`),
                    hash: "#" + record.i_type,
                    state: { backUrl: location.pathname },
                }}
            >
                {individual}
            </Link>{" "}
            {listRender}
        </>
    );
};

const SEARCH_RESULT_COLUMNS_EXP = [
    {
        title: "Experiment",
        dataIndex: "experiment_id",
        render: (experiment, record) => experimentRender(experiment, record),
        sorter: (a, b) => a.experiment_id.localeCompare(b.experiment_id),
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
        dataIndex: "biosample_id",
        render: (bioType) => <>{bioType}</>,
        sorter: (a, b) => a.biosample_id.localeCompare(b.biosample_id),
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Experiment Type",
        dataIndex: "experiment_type",
        render: (expType) => <>{expType}</>,
        sorter: (a, b) => a.experiment_type.localeCompare(b.experiment_type),
        sortDirections: ["descend", "ascend", "descend"],
    },
];

const ExperimentsTable = ({ data }) => {
    return (
        <ExplorerSearchResultsTableComp dataStructure={SEARCH_RESULT_COLUMNS_EXP} data={data} activeTab="experiments" />
    );
};

ExperimentsTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ExperimentsTable;
