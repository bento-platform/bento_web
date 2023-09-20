import React, {useCallback, useEffect, useMemo} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom";
import PropTypes from "prop-types";

import { Button, Descriptions, Popover, Table, Typography } from "antd";

import { EM_DASH } from "../../constants";
import { experimentPropTypesShape, individualPropTypesShape } from "../../propTypes";
import { getFileDownloadUrlsFromDrs } from "../../modules/drs/actions";
import { guessFileType } from "../../utils/guessFileType";

import { useDeduplicatedIndividualBiosamples } from "./utils";

import JsonView from "./JsonView";
import OntologyTerm from "./OntologyTerm";
import DownloadButton from "../DownloadButton";

const ExperimentResultDownloadButton = ({ resultFile }) => {
    const downloadUrls = useSelector((state) => state.drs.downloadUrlsByFilename);

    const url = downloadUrls[resultFile.filename]?.url;
    return url ? (
        <DownloadButton type="link" uri={url}>{""}</DownloadButton>
    ) : (
        <>{EM_DASH}</>
    );
};
ExperimentResultDownloadButton.propTypes = {
    resultFile: PropTypes.shape({
        filename: PropTypes.string,
    }),
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
        render: (_, result) => <ExperimentResultDownloadButton resultFile={result} />,
    },
    {
        key: "other_details",
        align: "center",
        render: (_, result) => (
            <Popover
                placement="leftTop"
                title={`Experiment Results: ${result.file_format}`}
                content={
                    <div className="other-details">
                        <Descriptions
                            layout="horizontal"
                            bordered={true}
                            colon={false}
                            column={1}
                            size="small"
                        >
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
                <Button size="small">See details</Button>
            </Popover>
        ),
    },
];

const ExperimentDetail = ({ individual, experiment }) => {
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
            <Typography.Title level={4}>{experimentType} - Details</Typography.Title>
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
                    <OntologyTerm individual={individual} term={experimentOntology?.[0] ?? experimentOntology} />
                </Descriptions.Item>
                <Descriptions.Item span={1} label="Molecule">
                    {molecule}
                </Descriptions.Item>
                <Descriptions.Item span={1} label="Molecule Ontology">
                    {/*
                    molecule_ontology is accidentally an array in Katsu, so this takes the first item
                    and falls back to just the field (if we fix this in the future)
                    */}
                    <OntologyTerm individual={individual} term={moleculeOntology?.[0] ?? moleculeOntology} />
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
            <Typography.Title level={4}>{experimentType} - Results</Typography.Title>
            <Table
                bordered={true}
                size="small"
                pagination={false}
                columns={EXPERIMENT_RESULTS_COLUMNS}
                rowKey="id"
                dataSource={sortedExperimentResults}
                style={{ maxWidth: 1200, backgroundColor: "white" }}
            />
        </div>
    );
};
ExperimentDetail.propTypes = {
    individual: individualPropTypesShape,
    experiment: experimentPropTypesShape,
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

    useEffect(() => {
        // retrieve any download urls if experiments data changes

        const downloadableFiles = experimentsData
            .flatMap((e) => e?.experiment_results ?? [])
            .map((r) => ({  // enforce file_format property
                ...r,
                file_format: r.file_format ?? guessFileType(r.filename),
            }))
            .filter(isDownloadable);

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
                render: (mo) => <OntologyTerm individual={individual} term={mo?.[0] ?? mo} />,
            },
            {
                title: "Experiment Results",
                key: "experiment_results",
                render: (exp) => <span>{exp.experiment_results.length ?? 0} files</span>,
            },
        ],
        [individual, handleExperimentClick],
    );

    const onExpand = useCallback(
        (e, experiment) => {
            handleExperimentClick(e ? experiment.id : undefined);
        },
        [handleExperimentClick],
    );

    const expandedRowRender = useCallback(
        (experiment) => (
            <ExperimentDetail
                individual={individual}
                experiment={experiment}
            />
        ),
        [handleExperimentClick],
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
}

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

// expand here accordingly
const isDownloadable = (result) =>
    ["vcf", "cram", "bw", "bigwig"].includes(result.file_format?.toLowerCase());

IndividualExperiments.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualExperiments;
