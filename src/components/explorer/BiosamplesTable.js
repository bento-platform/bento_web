import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { countNonNullElements } from "../../utils/misc";
import ExplorerSearchResultsTable from "./ExplorerSearchResultsTable";

const NO_EXPERIMENTS_VALUE = -Infinity;

const BiosampleRender = ({ biosample, alternateIds, individualId }) => {
    const alternateIdsList = alternateIds ?? [];
    const listRender = alternateIdsList.length ? ` (${alternateIdsList.join(", ")})` : "";
    return (
        <>
            <Link
                to={{
                    pathname: `/data/explorer/individuals/${individualId}/biosamples`,
                    state: { backUrl: location.pathname },
                }}
            >
                {biosample}
            </Link>{" "}
            {listRender}
        </>
    );
};

BiosampleRender.propTypes = {
    biosample: PropTypes.string.isRequired,
    alternateIds: PropTypes.arrayOf(PropTypes.string),
    individualId: PropTypes.string.isRequired,
};

const customPluralForms = {
    Serology: "Serologies",
};

const pluralize = (word, count) => {
    if (count <= 1) return word;

    if (customPluralForms[word]) {
        return customPluralForms[word];
    } else if (word.slice(-1) !== "s") {
        return word + "s";
    }

    return word;
};

const ExperimentsRender = ({studiesType}) => {
    const experimentCount = studiesType.reduce((acc, study) => {
        acc[study] = (acc[study] || 0) + 1;
        return acc;
    }, {});
    const formattedExperiments = Object.entries(experimentCount).map(
        ([study, count]) => `${count === studiesType.length ? "" : count + " "}${pluralize(study, count)}`,
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

ExperimentsRender.propTypes = {
    studiesType: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const experimentsSorter = (a, b) => {
    return countNonNullElements(a.studyTypes) - countNonNullElements(b.studyTypes);
};

const sampledTissuesRender = (sampledTissues) => sampledTissues.map((m) => m.label)[0];

const sampledTissuesSorter = (a, b) => {
    if (a.sampledTissues[0].label && b.sampledTissues[0].label) {
        return a.sampledTissues[0].label.toString().localeCompare(b.sampledTissues[0].label.toString());
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
            ([experiment, count]) => `${count} ${experiment}`,
        );
        return formattedExperiments.join(", ");
    } else {
        return "—";
    }
};


const availableExperimentsSorter = (a, b) => {
    const highestValue = (experimentsType) => {
        if (experimentsType.every((s) => s !== null)) {
            const experimentCount = experimentsType.reduce((acc, experiment) => {
                acc[experiment] = (acc[experiment] || 0) + 1;
                return acc;
            }, {});

            const counts = Object.values(experimentCount);
            return Math.max(...counts);
        } else {
            return NO_EXPERIMENTS_VALUE;
        }
    };

    const highA = highestValue(a.experimentTypes);
    const highB = highestValue(b.experimentTypes);

    return highB - highA;
};

const SEARCH_RESULT_COLUMNS_BIOSAMPLE = [
    {
        title: "Biosample",
        dataIndex: "biosample",
        render: (biosample, record) => (
            <BiosampleRender
                biosample={biosample}
                alternateIds={record.alternateIds}
                individualId={record.individual.id}
            />
        ),
        sorter: (a, b) => a.biosample.localeCompare(b.biosample),
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
        dataIndex: "studyTypes",
        render: (studyTypes) => <ExperimentsRender studiesType={studyTypes} />,
        sorter: experimentsSorter,
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Sampled Tissues",
        dataIndex: "sampledTissues",
        render: sampledTissuesRender,
        sorter: sampledTissuesSorter,
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Available Experiments",
        dataIndex: "experimentTypes",
        render: availableExperimentsRender,
        sorter: availableExperimentsSorter,
        sortDirections: ["descend", "ascend", "descend"],
    },
];

const BiosamplesTable = ({ data }) => {
    return (
        <ExplorerSearchResultsTable
            dataStructure={SEARCH_RESULT_COLUMNS_BIOSAMPLE}
            data={data}
            activeTab="biosamples"
        />
    );
};

BiosamplesTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            biosample: PropTypes.string.isRequired,
            alternateIds: PropTypes.arrayOf(PropTypes.string),
            individual: PropTypes.shape({
                id: PropTypes.string.isRequired,
            }).isRequired,
            studyTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
            sampledTissues: PropTypes.arrayOf(
                PropTypes.shape({
                    label: PropTypes.string.isRequired,
                }),
            ).isRequired,
            experimentTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
        }),
    ).isRequired,
};


export default BiosamplesTable;
