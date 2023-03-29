import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withBasePath } from "../../utils/url";
import ExplorerSearchResultsTableComp from "./ExplorerSearchResultsTableComp";

const biosampleRender = (individual, record) => {
    const alternateIds = individual.alternate_ids ?? [];
    const listRender = alternateIds.length ? " (" + alternateIds.join(", ") + ")" : "";
    return (
        <>
            <Link
                to={{
                    pathname: withBasePath(`data/explorer/individuals/${record.individual.id}/biosamples`),
                    state: { backUrl: location.pathname },
                }}
            >
                {individual}
            </Link>{" "}
            {listRender}
        </>
    );
};

const experimentsRender = (studiesType) => {
    const experimentCount = studiesType.reduce((acc, study) => {
        acc[study] = (acc[study] || 0) + 1;
        return acc;
    }, {});
    const formattedExperiments = Object.entries(experimentCount).map(
        ([study, count]) =>
            `${count === studiesType.length ? "" : count + " "}${study}${
                count > 1 && study.slice(-1) !== "s" ? "s" : ""
            }`
    );
    return (
        <>
            {studiesType.every((s) => s !== null) ? (
                <>
                    {studiesType.length} Experiment{studiesType.length === 1 ? "" : "s"}:{" "}
                    {formattedExperiments.join(", ")}
                </>
            ) : (
                <>—</>
            )}
        </>
    );
};

const experimentsSorter = (a, b) => {
    const countExperiments = (studiesType) => {
        return studiesType.filter((s) => s !== null).length;
    };

    return countExperiments(a.studies_type) - countExperiments(b.studies_type);
};

const sampledTissuesRender = (sampledTissues) => {
    return sampledTissues.map((m) => m.label)[0];
};

const sampledTissuesSorter = (a, b) => {
    if (a.sampled_tissues[0].label && b.sampled_tissues[0].label) {
        return a.sampled_tissues[0].label.toString().localeCompare(b.sampled_tissues[0].label.toString());
    }
    return 0;
};

const availableExperimentsRender = (experimentsType) => {
    if (experimentsType.every((s) => s !== null)) {
        const experimentCount = experimentsType.reduce((acc, experiment) => {
            acc[experiment] = (acc[experiment] || 0) + 1;
            return acc;
        }, {});
        const formattedExperiments = Object.entries(experimentCount).map(
            ([experiment, count]) => `${count} ${experiment}`
        );
        return formattedExperiments.join(", ");
    } else {
        return "—";
    }
};

const availableExperimentsSorter = (a, b) => {
    const highestValue = (formattedExperiments) => {
        if (formattedExperiments !== "—") {
            const counts = formattedExperiments.split(", ").map((experiment) => parseInt(experiment.split(" ")[0], 10));
            return Math.max(...counts);
        } else {
            return -Infinity;
        }
    };

    const highA = highestValue(availableExperimentsRender(a.experiments_type));
    const highB = highestValue(availableExperimentsRender(b.experiments_type));

    return highB - highA;
};

const SEARCH_RESULT_COLUMNS_BIOSAMPLE = [
    {
        title: "Biosample",
        dataIndex: "im_type",
        render: (bioType, record) => biosampleRender(bioType, record),
        sorter: (a, b) => a.im_type.localeCompare(b.im_type),
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
        title: "Experiments",
        dataIndex: "studies_type",
        render: experimentsRender,
        sorter: experimentsSorter,
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Sampled Tissues",
        dataIndex: "sampled_tissues",
        render: sampledTissuesRender,
        sorter: sampledTissuesSorter,
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Available Experiments",
        dataIndex: "experiments_type",
        render: availableExperimentsRender,
        sorter: availableExperimentsSorter,
        sortDirections: ["descend", "ascend", "descend"],
    },
];

const BiosamplesTable = ({ data }) => {
    return (
        <ExplorerSearchResultsTableComp
            dataStructure={SEARCH_RESULT_COLUMNS_BIOSAMPLE}
            data={data}
            activeTab="biosamples"
        />
    );
};

BiosamplesTable.propTypes = {
    data: PropTypes.array.isRequired,
};

export default BiosamplesTable;
