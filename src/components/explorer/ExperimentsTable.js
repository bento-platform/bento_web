import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { withBasePath } from "../../utils/url";
import ExplorerSearchResultsTable from "./ExplorerSearchResultsTable";

const ExperimentRender = ({ experimentId, individual }) => {
    const alternateIds = individual.alternate_ids ?? [];
    const listRender = alternateIds.length ? ` (${alternateIds.join(", ")})` : "";

    return (
        <>
            <Link
                to={{
                    pathname: withBasePath(`data/explorer/individuals/${individual.id}/experiments`),
                    hash: "#" + experimentId,
                    state: { backUrl: location.pathname },
                }}
            >
                {experimentId}
            </Link>{" "}
            {listRender}
        </>
    );
};

ExperimentRender.propTypes = {
    experimentId: PropTypes.string.isRequired,
    individual: PropTypes.shape({
        id: PropTypes.string.isRequired,
        alternate_ids: PropTypes.arrayOf(PropTypes.string),
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

const ExperimentsTable = ({ data }) => {
    return (
        <ExplorerSearchResultsTable dataStructure={SEARCH_RESULT_COLUMNS_EXP} data={data} activeTab="experiments" />
    );
};

ExperimentsTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            experimentId: PropTypes.string.isRequired,
            individual: PropTypes.shape({
                id: PropTypes.string.isRequired,
                alternate_ids: PropTypes.arrayOf(PropTypes.string),
            }).isRequired,
            biosampleId: PropTypes.string.isRequired,
            studyType: PropTypes.string.isRequired,
            experimentType: PropTypes.string.isRequired,
        }),
    ).isRequired,
};

export default ExperimentsTable;
