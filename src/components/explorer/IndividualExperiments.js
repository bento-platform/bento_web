import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Collapse, Descriptions, Icon, Popover, Table } from "antd";
import JsonView from "./JsonView";
import FileSaver from "file-saver";
import { EM_DASH } from "../../constants";
import { individualPropTypesShape } from "../../propTypes";
import { getFileDownloadUrlsFromDrs } from "../../modules/drs/actions";
import { guessFileType } from "../../utils/guessFileType";

const { Panel } = Collapse;

const IndividualExperiments = ({ individual }) => {
    const blankExperimentOntology = [{ id: EM_DASH, label: EM_DASH }];

    const downloadUrls = useSelector(
        (state) => state.drs.downloadUrlsByFilename
    );
    const dispatch = useDispatch();
    const history = useHistory();

    const biosamplesData = (individual?.phenopackets ?? []).flatMap(
        (p) => p.biosamples
    );
    const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);
    let results = experimentsData.flatMap((e) => e?.experiment_results ?? []);

    // enforce file_format property
    results = results.map((r) => {
        return {
            ...r,
            file_format: r.file_format ?? guessFileType(r.filename),
        };
    });

    const downloadableFiles = results.filter(isDownloadable);

    useEffect(() => {
        // retrieve any download urls on mount
        dispatch(getFileDownloadUrlsFromDrs(downloadableFiles));
    }, []);

    const selected = history.location.hash.slice(1);
    const opened = [];
    if (selected && selected.length > 1) opened.push(selected);

    const renderDownloadButton = (resultFile) => {
        return downloadUrls[resultFile.filename]?.url ? (
            <div>
                <a
                    onClick={async () =>
                        FileSaver.saveAs(
                            downloadUrls[resultFile.filename].url,
                            resultFile.filename
                        )
                    }
                >
                    <Icon type={"cloud-download"} />
                </a>
            </div>
        ) : (
            EM_DASH
        );
    };

    const EXPERIMENT_RESULTS_COLUMNS = [
        {
            title: "Result File",
            key: "result_file",
            render: (_, result) => result.file_format,
        },
        {
            title: "Creation Date",
            key: "creation_date",
            render: (_, result) => result.creation_date,
        },
        {
            title: "Description",
            key: "description",
            render: (_, result) => result.description,
        },
        {
            title: "Filename",
            key: "filename",
            render: (_, result) => result.filename,
        },
        {
            title: "Download",
            key: "download",
            align: "center",
            render: (_, result) => renderDownloadButton(result),
        },
        {
            title: "Other Details",
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
                                <Descriptions.Item label="identifier">
                                    {result.identifier}
                                </Descriptions.Item>
                                <Descriptions.Item label="description">
                                    {result.description}
                                </Descriptions.Item>
                                <Descriptions.Item label="filename">
                                    {result.filename}
                                </Descriptions.Item>
                                <Descriptions.Item label="file format">
                                    {result.file_format}
                                </Descriptions.Item>
                                <Descriptions.Item label="data output type">
                                    {result.data_output_type}
                                </Descriptions.Item>
                                <Descriptions.Item label="usage">
                                    {result.usage}
                                </Descriptions.Item>
                                <Descriptions.Item label="creation date">
                                    {result.creation_date}
                                </Descriptions.Item>
                                <Descriptions.Item label="created by">
                                    {result.created_by}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    }
                    trigger="click"
                >
                    <Button> click here </Button>
                </Popover>
            ),
        },
    ];

    return (
        <>
            <Collapse defaultActiveKey={opened}>
                {experimentsData.map((e) => (
                    <Panel
                        key={e.id}
                        header={`${e.experiment_type} (Biosample ${e.biosample})`}
                    >
                        <div
                            className="experiment_and_results"
                            id={e.biosample}
                            key={e.id}
                        >
                            <div className="experiment_summary">
                                <Descriptions
                                    layout="vertical"
                                    bordered={true}
                                    colon={false}
                                    column={1}
                                    size="small"
                                    key={e.id}
                                >
                                    <Descriptions.Item>
                                        {(e.molecule_ontology ?? []).map(
                                            (mo) => (
                                                <Descriptions
                                                    title="Molecule Ontology"
                                                    layout="horizontal"
                                                    bordered={true}
                                                    column={1}
                                                    size="small"
                                                    key={mo.id}
                                                >
                                                    <Descriptions.Item label="id">
                                                        {mo.id}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="label">
                                                        {mo.label}
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            )
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item>
                                        {(
                                            e.experiment_ontology ||
                                            blankExperimentOntology
                                        ).map((eo) => (
                                            <Descriptions
                                                title="Experiment Ontology"
                                                layout="horizontal"
                                                bordered={true}
                                                column={1}
                                                size="small"
                                                key={eo.id}
                                            >
                                                <Descriptions.Item label="id">
                                                    {eo.id}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="label">
                                                    {eo.label}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        ))}
                                    </Descriptions.Item>
                                    <Descriptions.Item>
                                        <Descriptions
                                            title="Instrument"
                                            layout="horizontal"
                                            bordered={true}
                                            column={1}
                                            size="small"
                                        >
                                            <Descriptions.Item label="platform">
                                                {e.instrument.platform}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="identifier">
                                                {e.instrument.identifier}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Descriptions.Item>
                                </Descriptions>
                                <Descriptions
                                    layout="vertical"
                                    bordered={true}
                                    column={1}
                                    size="small"
                                >
                                    <Descriptions.Item>
                                        <Descriptions
                                            layout="horizontal"
                                            bordered={true}
                                            column={1}
                                            size="small"
                                        >
                                            <Descriptions.Item label="Experiment Type">
                                                {e.experiment_type}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Study Type">
                                                {e.study_type}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Extraction Protocol">
                                                {e.extraction_protocol}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Library Layout">
                                                {e.library_layout}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Library Selection">
                                                {e.library_selection}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Library Source">
                                                {e.library_source}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Library Strategy">
                                                {e.library_strategy}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Descriptions.Item>
                                    <Descriptions.Item>
                                        <Descriptions
                                            title="Extra Properties"
                                            layout="horizontal"
                                            bordered={true}
                                            column={1}
                                            size="small"
                                        >
                                            <Descriptions.Item>
                                                <JsonView
                                                    inputJson={
                                                        e.extra_properties
                                                    }
                                                />
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                            <Descriptions
                                title={`${e.experiment_type} - Results`}
                                bordered
                            />
                            <Table
                                // bordered
                                size="small"
                                pagination={false}
                                columns={EXPERIMENT_RESULTS_COLUMNS}
                                rowKey="filename"
                                dataSource={(e.experiment_results || []).sort(
                                    (r1, r2) =>
                                        r1.file_format > r2.file_format ? 1 : -1
                                )}
                            />
                        </div>
                    </Panel>
                ))}
            </Collapse>
        </>
    );
};

// expand here accordingly
const isDownloadable = (result) =>
    ["vcf", "cram", "bw", "bigwig"].includes(result.file_format?.toLowerCase());

IndividualExperiments.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualExperiments;
