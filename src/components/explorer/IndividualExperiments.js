import React, {useCallback, useEffect, useMemo, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom";
import PropTypes from "prop-types";

import { Button, Descriptions, Icon, Modal, Popover, Table, Typography } from "antd";

import { EM_DASH } from "../../constants";
import { experimentPropTypesShape, experimentResultPropTypesShape, individualPropTypesShape } from "../../propTypes";
import { getFileDownloadUrlsFromDrs } from "../../modules/drs/actions";
import { guessFileType } from "../../utils/guessFileType";

import { useDeduplicatedIndividualBiosamples, useIndividualResources } from "./utils";

import JsonView from "./JsonView";
import OntologyTerm from "./OntologyTerm";
import DownloadButton from "../DownloadButton";
import FileDisplay, { VIEWABLE_FILE_EXTENSIONS } from "../display/FileDisplay";

const ExperimentResultDownloadButton = ({ result }) => {
    const downloadUrls = useSelector((state) => state.drs.downloadUrlsByFilename);

    const url = downloadUrls[result.filename]?.url;
    return url ? (
        <DownloadButton size="small" type="link" uri={url}>{""}</DownloadButton>
    ) : (
        <>{EM_DASH}</>
    );
};
ExperimentResultDownloadButton.propTypes = {
    result: experimentResultPropTypesShape,
};

const VIEWABLE_FILE_FORMATS = ["PDF", "CSV", "TSV"];

const ExperimentResultActions = ({ result }) => {
    const downloadUrls = useSelector((state) => state.drs.downloadUrlsByFilename);
    const url = downloadUrls[result.filename]?.url;

    const [viewModalVisible, setViewModalVisible] = useState(false);

    // Slightly different from viewModalVisible - this is just set on the first click of the
    // view button and results in file loading being triggered. if FileDisplay was always
    // immediately shown, it would load all experiment results immediately, which is undesirable
    // behaviour. Instead, we wait until a user clicks it, then load the file, but we don't unmount
    // the component after so we have the file contents cached.
    const [hasTriggeredViewModal, setHasTriggeredViewModal] = useState(false);

    const onViewClick = useCallback(() => {
        setHasTriggeredViewModal(true);
        setViewModalVisible(true);
    }, []);
    const onViewCancel = useCallback(() => setViewModalVisible(false), []);

    const resultViewable = VIEWABLE_FILE_FORMATS.includes(result.file_format)
        || !!VIEWABLE_FILE_EXTENSIONS.find(ext => result.filename.endsWith(ext));

    return <>
        {resultViewable ? <>
            <Modal
                title={<span>View: {result.filename}</span>}
                visible={viewModalVisible}
                onCancel={onViewCancel}
                width={1080}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "-50px"}}>
                {hasTriggeredViewModal && (
                    <FileDisplay uri={url} fileName={result.filename} />
                )}
            </Modal>
            <Button size="small" icon="eye" onClick={onViewClick}>View</Button>{" "}
        </> : null}
        <Popover
            placement="leftTop"
            title={`Experiment Results: ${result.file_format}`}
            content={
                <div className="other-details">
                    <Descriptions layout="horizontal" bordered={true} colon={false} column={1} size="small">
                        <Descriptions.Item label="Identifier">
                            {result.identifier}
                        </Descriptions.Item>
                        <Descriptions.Item label="Description">
                            {result.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Filename">
                            {result.filename}
                        </Descriptions.Item>
                        <Descriptions.Item label="File format">
                            {result.file_format}
                        </Descriptions.Item>
                        <Descriptions.Item label="Data output type">
                            {result.data_output_type}
                        </Descriptions.Item>
                        <Descriptions.Item label="Usage">
                            {result.usage}
                        </Descriptions.Item>
                        <Descriptions.Item label="Creation date">
                            {result.creation_date}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created by">
                            {result.created_by}
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            }
            trigger="click"
        >
            <Button size="small" icon="bars">See details</Button>
        </Popover>
    </>;
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
        title: "Download",
        key: "download",
        align: "center",
        render: (_, result) => <ExperimentResultDownloadButton result={result} />,
    },
    {
        key: "other_details",
        align: "center",
        render: (_, result) => <ExperimentResultActions result={result} />,
    },
];

const ExperimentDetail = ({ experiment, resourcesTuple }) => {
    const {
        id,
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
        () =>
            [...(experimentResults || [])].sort((r1, r2) => r1.file_format > r2.file_format ? 1 : -1),
        [experimentResults]);

    return (
        <div className="experiment_and_results">
            <Typography.Title level={4}><Icon type="profile" /> Details</Typography.Title>
            <Descriptions layout="horizontal" bordered={true} column={2} size="small" style={{ maxWidth: 1200 }}>
                <Descriptions.Item span={2} label="ID">
                    <span style={{ fontFamily: "monospace" }}>{id}</span>
                </Descriptions.Item>
                <Descriptions.Item span={1} label="Experiment Type">{experimentType}</Descriptions.Item>
                <Descriptions.Item span={1} label="Experiment Ontology">
                    {/*
                    experiment_ontology is accidentally an array in Katsu, so this takes the first item
                    and falls back to just the field (if we fix this in the future)
                    */}
                    <OntologyTerm
                        resourcesTuple={resourcesTuple}
                        term={experimentOntology?.[0] ?? experimentOntology}
                    />
                </Descriptions.Item>
                <Descriptions.Item span={1} label="Molecule">
                    {molecule}
                </Descriptions.Item>
                <Descriptions.Item span={1} label="Molecule Ontology">
                    {/*
                    molecule_ontology is accidentally an array in Katsu, so this takes the first item
                    and falls back to just the field (if we fix this in the future)
                    */}
                    <OntologyTerm resourcesTuple={resourcesTuple} term={moleculeOntology?.[0] ?? moleculeOntology} />
                </Descriptions.Item>
                <Descriptions.Item label="Study Type">{studyType}</Descriptions.Item>
                <Descriptions.Item label="Extraction Protocol">{extractionProtocol}</Descriptions.Item>
                <Descriptions.Item span={1} label="Library Layout">{libraryLayout}</Descriptions.Item>
                <Descriptions.Item span={1} label="Library Selection">{librarySelection}</Descriptions.Item>
                <Descriptions.Item span={1} label="Library Source">{librarySource}</Descriptions.Item>
                <Descriptions.Item span={1} label="Library Strategy">{libraryStrategy}</Descriptions.Item>
                <Descriptions.Item span={2} label="Instrument">
                    <div style={{ display: "flex", gap: 16 }}>
                        <div>
                            <strong>Platform:</strong>&nbsp;{instrument.platform}
                        </div>
                        <div>
                            <strong>ID:</strong>&nbsp;
                            <span style={{ fontFamily: "monospace" }}>{instrument.identifier}</span>
                        </div>
                    </div>
                </Descriptions.Item>
                <Descriptions.Item span={2} label="Extra Properties">
                    <JsonView inputJson={extraProperties} />
                </Descriptions.Item>
            </Descriptions>
            <Typography.Title level={4}>
                <Icon type="file-text" /> {sortedExperimentResults.length ? "Results" : "No experiment results"}
            </Typography.Title>
            {sortedExperimentResults.length ? <Table
                bordered={true}
                size="small"
                pagination={false}
                columns={EXPERIMENT_RESULTS_COLUMNS}
                rowKey="id"
                dataSource={sortedExperimentResults}
                style={{ maxWidth: 1200, backgroundColor: "white" }}
            /> : null}
        </div>
    );
};
ExperimentDetail.propTypes = {
    experiment: experimentPropTypesShape,
    resourcesTuple: PropTypes.array,
};

const Experiments = ({ individual, handleExperimentClick }) => {
    const dispatch = useDispatch();

    const { selectedExperiment } = useParams();
    const selectedRowKeys = useMemo(
        () => selectedExperiment ? [selectedExperiment] : [],
        [selectedExperiment],
    );

    useEffect(() => {
        // If, on first load, there's a selected experiment:
        //  - find the experiment-${id} element (a span in the table row)
        //  - scroll it into view
        setTimeout(() => {
            if (selectedExperiment) {
                const el = document.getElementById(`experiment-${selectedExperiment}`);
                if (!el) return;
                el.scrollIntoView();
            }
        }, 100);
    }, []);

    const biosamplesData = useDeduplicatedIndividualBiosamples(individual);
    const experimentsData = useMemo(
        () => biosamplesData.flatMap((b) => b?.experiments ?? []),
        [biosamplesData],
    );
    const resourcesTuple = useIndividualResources(individual);

    useEffect(() => {
        // retrieve any download urls if experiments data changes

        const downloadableFiles = experimentsData
            .flatMap((e) => e?.experiment_results ?? [])
            .map((r) => ({  // enforce file_format property
                ...r,
                file_format: r.file_format ? r.file_format.toLowerCase() : guessFileType(r.filename).toLowerCase(),
            }));

        dispatch(getFileDownloadUrlsFromDrs(downloadableFiles));
    }, [experimentsData]);

    const columns = useMemo(
        () => [
            {
                title: "Experiment Type",
                dataIndex: "experiment_type",
                render: (type, { id }) => <span id={`experiment-${id}`}>{type}</span>,  // scroll anchor wrapper
            },
            {
                title: "Molecule",
                dataIndex: "molecule_ontology",
                render: (mo) => <OntologyTerm resourcesTuple={resourcesTuple} term={mo?.[0] ?? mo} />,
            },
            {
                title: "Experiment Results",
                key: "experiment_results",
                // experiment_results can be undefined if no experiment results exist
                render: (exp) => <span>{exp.experiment_results?.length ?? 0} files</span>,
            },
        ],
        [resourcesTuple, handleExperimentClick],
    );

    const onExpand = useCallback(
        (e, experiment) => {
            handleExperimentClick(e ? experiment.id : undefined);
        },
        [handleExperimentClick],
    );

    const expandedRowRender = useCallback(
        (experiment) => (
            <ExperimentDetail experiment={experiment} resourcesTuple={resourcesTuple} />
        ),
        [resourcesTuple],
    );

    return (
        <Table
            bordered={true}
            pagination={false}
            size="middle"
            columns={columns}
            onExpand={onExpand}
            expandedRowKeys={selectedRowKeys}
            expandedRowRender={expandedRowRender}
            dataSource={experimentsData}
            rowKey="id"
        />
    );
};
Experiments.propTypes = {
    individual: individualPropTypesShape,
    handleExperimentClick: PropTypes.func,
};

const IndividualExperiments = ({ individual }) => {
    const history = useHistory();
    const match = useRouteMatch();

    const handleExperimentClick = useCallback((eID) => {
        if (!eID) {
            history.replace(match.url);
            return;
        }
        history.replace(`${match.url}/${eID}`);
    }, [history, match]);

    const experimentsNode = (
        <Experiments individual={individual} handleExperimentClick={handleExperimentClick} />
    );

    return (
        <Switch>
            <Route path={`${match.path}/:selectedExperiment`}>{experimentsNode}</Route>
            <Route path={match.path} exact={true}>{experimentsNode}</Route>
        </Switch>
    );
};

IndividualExperiments.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualExperiments;
