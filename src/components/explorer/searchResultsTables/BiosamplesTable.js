import React from "react";
import PropTypes from "prop-types";
import { useSortedColumns } from "../hooks/explorerHooks";
import { useSelector } from "react-redux";

import BiosampleIDCell from "./BiosampleIDCell";
import ExplorerSearchResultsTable from "../ExplorerSearchResultsTable";
import IndividualIDCell from "./IndividualIDCell";
import OntologyTerm from "../OntologyTerm";

import { ontologyShape } from "../../../propTypes";
import { countNonNullElements } from "../../../utils/misc";
import { ontologyTermSorter } from "../utils";

const NO_EXPERIMENTS_VALUE = -Infinity;

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

const ExperimentsRender = ({ studiesType }) => {
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
          {studiesType.length} Experiment{studiesType.length === 1 ? "" : "s"}: {formattedExperiments.join(", ")}
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

const availableExperimentsRender = (experimentsType) => {
  if (experimentsType.every((s) => s !== null)) {
    const experimentCount = experimentsType.reduce((acc, experiment) => {
      acc[experiment] = (acc[experiment] || 0) + 1;
      return acc;
    }, {});
    const formattedExperiments = Object.entries(experimentCount).map(([experiment, count]) => `${count} ${experiment}`);
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

const BIOSAMPLES_COLUMNS = [
  {
    title: "Biosample",
    dataIndex: "biosample",
    render: (biosample, { individual }) => <BiosampleIDCell biosample={biosample} individualID={individual.id} />,
    sorter: (a, b) => a.biosample.localeCompare(b.biosample),
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
    title: "Experiments",
    dataIndex: "studyTypes",
    render: (studyTypes) => <ExperimentsRender studiesType={studyTypes} />,
    sorter: experimentsSorter,
    sortDirections: ["descend", "ascend", "descend"],
  },
  {
    title: "Sampled Tissue",
    dataIndex: "sampledTissue",
    // Can't pass individual here to OntologyTerm since it doesn't have a list of phenopackets
    render: (sampledTissue) => <OntologyTerm term={sampledTissue} />,
    sorter: ontologyTermSorter("sampledTissue"),
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

const BiosamplesTable = ({ data, datasetID }) => {
  const tableSortOrder = useSelector((state) => state.explorer.tableSortOrderByDatasetID[datasetID]?.["biosamples"]);

  const { sortedData, columnsWithSortOrder } = useSortedColumns(data, tableSortOrder, BIOSAMPLES_COLUMNS);

  console.log(sortedData, "sortedData_biosample");

  return (
    <ExplorerSearchResultsTable
      data={sortedData}
      sortColumnKey={tableSortOrder?.sortColumnKey}
      sortOrder={tableSortOrder?.sortOrder}
      activeTab="biosamples"
      columns={columnsWithSortOrder}
      currentPage={tableSortOrder?.currentPage}
    />
  );
};

BiosamplesTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      biosample: PropTypes.string.isRequired,
      individual: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired,
      studyTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
      sampledTissue: ontologyShape,
      experimentTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
  datasetID: PropTypes.string.isRequired,
};

export default BiosamplesTable;
