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
        dataIndex: "i_type",
        render: (experiment, record) => experimentRender(experiment, record),
        sorter: (a, b) => a.i_type.localeCompare(b.i_type),
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
        dataIndex: "if_type",
        render: (bioType) => <>{bioType}</>,
        sorter: (a, b) => a.if_type.localeCompare(b.if_type),
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Experiment Type",
        dataIndex: "e_type",
        render: (expType) => <>{expType}</>,
        sorter: (a, b) => a.e_type.localeCompare(b.e_type),
        sortDirections: ["descend", "ascend", "descend"],
    },
];

const ExperimentsTable = ({ data }) => {
    console.log("ExperimentsTable data", data);
    return (
        <ExplorerSearchResultsTableComp
            dataStructure={SEARCH_RESULT_COLUMNS_EXP}
            data={data}
            activeTab="experiments"
        />
    );
};

ExperimentsTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ExperimentsTable;
