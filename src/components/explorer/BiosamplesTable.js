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

    return countExperiments(a.study_types) - countExperiments(b.study_types);
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

    const highA = highestValue(availableExperimentsRender(a.experiment_types));
    const highB = highestValue(availableExperimentsRender(b.experiment_types));

    return highB - highA;
};

const SEARCH_RESULT_COLUMNS_BIOSAMPLE = [
    {
        title: "Biosample",
        dataIndex: "biosample_id",
        render: (bioType, record) => biosampleRender(bioType, record),
        sorter: (a, b) => a.biosample_id.localeCompare(b.biosample_id),
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
        dataIndex: "study_types",
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
        dataIndex: "experiment_types",
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
