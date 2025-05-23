import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PropTypes from "prop-types";

import { Button, Descriptions, Popover, Table, Tooltip, Typography } from "antd";
import { BarsOutlined, EyeOutlined, FileTextOutlined, ProfileOutlined } from "@ant-design/icons";

import { EM_DASH } from "@/constants";
import { experimentPropTypesShape, experimentResultPropTypesShape, individualPropTypesShape } from "@/propTypes";
import { getFileDownloadUrlsFromDrs } from "@/modules/drs/actions";
import { useAppDispatch, useAppSelector } from "@/store";
import { guessFileType } from "@/utils/files";

import { useDeduplicatedIndividualBiosamples } from "./utils";
import { VIEWABLE_FILE_EXTENSIONS } from "@/components/display/FileDisplay";

import DownloadButton from "@/components/common/DownloadButton";
import MonospaceText from "@/components/common/MonospaceText";
import FileModal from "@/components/display/FileModal";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "@/components/explorer/RoutedIndividualContent";
import OntologyTerm from "./OntologyTerm";
import ExtraProperties from "./ExtraProperties";

const BiosampleLink = ({ biosample }) =>
  biosample ? <Link to={`../../biosamples/${biosample}`}>{biosample}</Link> : EM_DASH;
BiosampleLink.propTypes = {
  biosample: PropTypes.string,
};

const VIEWABLE_FILE_FORMATS = ["PDF", "CSV", "TSV"];

const ExperimentResultActions = ({ result }) => {
  const { filename } = result;

  const downloadUrls = useAppSelector((state) => state.drs.downloadUrlsByFilename);
  const url = downloadUrls[filename]?.url;

  const [viewModalVisible, setViewModalVisible] = useState(false);

  // Slightly different from viewModalVisible - this is just set on the first click of the
  // view button and results in file loading being triggered. if FileDisplay was always
  // immediately shown, it would load all experiment results immediately, which is undesirable
  // behaviour. Instead, we wait until a user clicks it, then load the file, but we don't unmount
  // the component after, so we have the file contents cached.
  const [hasTriggeredViewModal, setHasTriggeredViewModal] = useState(false);

  const onViewClick = useCallback(() => {
    setHasTriggeredViewModal(true);
    setViewModalVisible(true);
  }, []);
  const onViewCancel = useCallback(() => setViewModalVisible(false), []);

  const resultViewable =
    url &&
    (VIEWABLE_FILE_FORMATS.includes(result.file_format) ||
      !!VIEWABLE_FILE_EXTENSIONS.find((ext) => filename.toLowerCase().endsWith(ext)));

  return (
    <div style={{ whiteSpace: "nowrap" }}>
      {url ? (
        <>
          <Tooltip title="Download">
            <DownloadButton size="small" uri={url} fileName={filename}>
              {""}
            </DownloadButton>
          </Tooltip>{" "}
        </>
      ) : null}
      {resultViewable ? (
        <>
          <FileModal
            open={viewModalVisible}
            onCancel={onViewCancel}
            title={<span>View: {result.filename}</span>}
            url={url}
            fileName={result.filename}
            hasTriggered={hasTriggeredViewModal}
          />
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={onViewClick} />
          </Tooltip>{" "}
        </>
      ) : null}
      <Popover
        placement="leftTop"
        title={`Experiment Results: ${result.file_format}`}
        content={
          <div className="other-details">
            <Descriptions layout="horizontal" bordered={true} colon={false} column={1} size="small">
              <Descriptions.Item label="Identifier">{result.identifier}</Descriptions.Item>
              <Descriptions.Item label="Description">{result.description}</Descriptions.Item>
              <Descriptions.Item label="Filename">{result.filename}</Descriptions.Item>
              <Descriptions.Item label="Format">{result.file_format}</Descriptions.Item>
              <Descriptions.Item label="Assembly ID">{result.genome_assembly_id ?? EM_DASH}</Descriptions.Item>
              <Descriptions.Item label="Data output type">{result.data_output_type ?? EM_DASH}</Descriptions.Item>
              <Descriptions.Item label="Usage">{result.usage}</Descriptions.Item>
              <Descriptions.Item label="Creation date">{result.creation_date}</Descriptions.Item>
              <Descriptions.Item label="Created by">{result.created_by}</Descriptions.Item>
            </Descriptions>
          </div>
        }
        trigger="click"
      >
        <Tooltip title="Details">
          <Button size="small" icon={<BarsOutlined />} />
        </Tooltip>
      </Popover>
    </div>
  );
};
ExperimentResultActions.propTypes = {
  result: experimentResultPropTypesShape,
};

const EXPERIMENT_RESULTS_COLUMNS = [
  {
    title: "File Format",
    dataIndex: "file_format",
  },
  {
    title: "Creation Date",
    dataIndex: "creation_date",
  },
  {
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Filename",
    dataIndex: "filename",
  },
  {
    key: "other_details",
    align: "center",
    render: (_, result) => <ExperimentResultActions result={result} />,
  },
];

export const ExperimentDetail = ({ experiment }) => {
  const {
    id,
    biosample,
    experiment_type: experimentType,
    experiment_ontology: experimentOntology,
    molecule,
    molecule_ontology: moleculeOntology,
    instrument,
    study_type: studyType,
    extraction_protocol: extractionProtocol,
    library_layout: libraryLayout,
    library_selection: librarySelection,
    library_source: librarySource,
    library_strategy: libraryStrategy,
    experiment_results: experimentResults,
    extra_properties: extraProperties,
  } = experiment;

  const sortedExperimentResults = useMemo(
    () => [...(experimentResults || [])].sort((r1, r2) => (r1.file_format > r2.file_format ? 1 : -1)),
    [experimentResults],
  );

  return (
    <div className="experiment_and_results">
      <Typography.Title level={4}>
        <ProfileOutlined /> Details
      </Typography.Title>
      <Descriptions layout="horizontal" bordered={true} column={2} size="small" style={{ maxWidth: 1200 }}>
        <Descriptions.Item span={1} label="ID">
          <MonospaceText>{id}</MonospaceText>
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Biosample">
          <BiosampleLink biosample={biosample} />
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Experiment Type">
          {experimentType}
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Experiment Ontology">
          {/*
                    experiment_ontology is accidentally an array in Katsu, so this takes the first item
                    and falls back to just the field (if we fix this in the future)
                    */}
          <OntologyTerm term={experimentOntology?.[0] ?? experimentOntology} />
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Molecule">
          {molecule}
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Molecule Ontology">
          {/*
                    molecule_ontology is accidentally an array in Katsu, so this takes the first item
                    and falls back to just the field (if we fix this in the future)
                    */}
          <OntologyTerm term={moleculeOntology?.[0] ?? moleculeOntology} />
        </Descriptions.Item>
        <Descriptions.Item label="Study Type">{studyType}</Descriptions.Item>
        <Descriptions.Item label="Extraction Protocol">{extractionProtocol}</Descriptions.Item>
        <Descriptions.Item span={1} label="Library Layout">
          {libraryLayout}
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Library Selection">
          {librarySelection}
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Library Source">
          {librarySource}
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Library Strategy">
          {libraryStrategy}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="Instrument">
          <div style={{ display: "flex", gap: 16 }}>
            <div>
              <strong>Platform:</strong>&nbsp;{instrument.platform}
            </div>
            <div>
              <strong>ID:</strong>&nbsp;<MonospaceText>{instrument.identifier}</MonospaceText>
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item span={2} label="Extra Properties">
          <ExtraProperties extraProperties={extraProperties} />
        </Descriptions.Item>
      </Descriptions>
      <Typography.Title level={4}>
        <FileTextOutlined /> {sortedExperimentResults.length ? "Results" : "No experiment results"}
      </Typography.Title>
      {sortedExperimentResults.length ? (
        <Table
          bordered={true}
          size="small"
          pagination={false}
          columns={EXPERIMENT_RESULTS_COLUMNS}
          rowKey="id"
          dataSource={sortedExperimentResults}
          style={{ maxWidth: 1200, backgroundColor: "white" }}
        />
      ) : null}
    </div>
  );
};
ExperimentDetail.propTypes = {
  experiment: experimentPropTypesShape,
};

const expandedExperimentRowRender = (experiment) => <ExperimentDetail experiment={experiment} />;

const EXPERIMENT_COLUMNS = [
  {
    title: "Experiment Type",
    dataIndex: "experiment_type",
    render: (type, { id }) => <span id={`experiment-${id}`}>{type}</span>, // scroll anchor wrapper
  },
  {
    title: "Biosample",
    dataIndex: "biosample",
    render: (biosample) => <BiosampleLink biosample={biosample} />,
  },
  {
    title: "Molecule",
    dataIndex: "molecule_ontology",
    render: (mo) => <OntologyTerm term={mo?.[0] ?? mo} />,
  },
  {
    title: "Experiment Results",
    key: "experiment_results",
    // experiment_results can be undefined if no experiment results exist
    render: (exp) => <span>{exp.experiment_results?.length ?? 0} files</span>,
  },
];

const Experiments = ({ individual, handleExperimentClick }) => {
  const dispatch = useAppDispatch();

  const { selectedExperiment } = useParams();

  useEffect(() => {
    // If there's a selected experiment:
    //  - find the experiment-${id} element (a span in the table row)
    //  - scroll it into view
    setTimeout(() => {
      if (selectedExperiment) {
        const el = document.getElementById(`experiment-${selectedExperiment}`);
        if (!el) return;
        el.scrollIntoView();
      }
    }, 100);
  }, [selectedExperiment]);

  const biosamplesData = useDeduplicatedIndividualBiosamples(individual);
  const experimentsData = useMemo(() => biosamplesData.flatMap((b) => b?.experiments ?? []), [biosamplesData]);

  useEffect(() => {
    // retrieve any download urls if experiments data changes

    const downloadableFiles = experimentsData
      .flatMap((e) => e?.experiment_results ?? [])
      .map((r) => ({
        // enforce file_format property
        ...r,
        file_format: r.file_format ?? guessFileType(r.filename),
      }));

    dispatch(getFileDownloadUrlsFromDrs(downloadableFiles)).catch(console.error);
  }, [dispatch, experimentsData]);

  return (
    <RoutedIndividualContentTable
      data={experimentsData}
      urlParam="selectedExperiment"
      columns={EXPERIMENT_COLUMNS}
      rowKey="id"
      handleRowSelect={handleExperimentClick}
      expandedRowRender={expandedExperimentRowRender}
    />
  );
};
Experiments.propTypes = {
  individual: individualPropTypesShape,
  handleExperimentClick: PropTypes.func,
};

const IndividualExperiments = ({ individual }) => (
  <RoutedIndividualContent
    urlParam="selectedExperiment"
    renderContent={({ onContentSelect }) => (
      <Experiments individual={individual} handleExperimentClick={onContentSelect} />
    )}
  />
);

IndividualExperiments.propTypes = {
  individual: individualPropTypesShape,
};

export default IndividualExperiments;
