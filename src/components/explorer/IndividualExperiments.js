import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Collapse, Descriptions, Empty, Icon, Popover, Table } from "antd";
import JsonView from "./JsonView";
import FileSaver from "file-saver";
import { EM_DASH } from "../../constants";
import { individualPropTypesShape } from "../../propTypes";
import { getFileDownloadUrlsFromDrs } from "../../modules/drs/actions";
import { guessFileType } from "../../utils/guessFileType";
import PropTypes from "prop-types";
import {useDeduplicatedIndividualBiosamples} from "./utils";
import OntologyTerm from "./OntologyTerm";

const { Panel } = Collapse;

const DownloadButton = ({ resultFile }) => {
    const downloadUrls = useSelector((state) => state.drs.downloadUrlsByFilename);

    const url = downloadUrls[resultFile.filename]?.url;
    if (!url) {
        return <>{EM_DASH}</>;
    }

    const saveAs = () =>
        FileSaver.saveAs(
            downloadUrls[resultFile.filename].url,
            resultFile.filename,
        );

    return (
        <div>
            <a onClick={saveAs}>
                <Icon type="cloud-download" />
            </a>
        </div>
    );
};
DownloadButton.propTypes = {
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
        render: (_, result) => <DownloadButton resultFile={result} />,
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

const IndividualExperiments = ({ individual }) => {
    const dispatch = useDispatch();
    const history = useHistory();

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

    const selected = history.location.hash.slice(1);
    const opened = (selected && selected.length > 1) ? [selected] : [];

    if (!experimentsData.length) {
        return <Empty description="No experiments" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
        <Collapse defaultActiveKey={opened}>
            {experimentsData.map((e) => (
                <Panel
                    key={e.id}
                    header={`${e.experiment_type} (Biosample ${e.biosample})`}
                >
                    <div className="experiment_and_results" id={e.biosample} key={e.id}>
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
                                    {/*
                                    molecule_ontology is accidentally an array in Katsu, so this takes the first item
                                    and falls back to just the field (if we fix this in the future)
                                    */}
                                    <OntologyTerm
                                        individual={individual}
                                        term={e.molecule_ontology?.[0] ?? e.molecule_ontology}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="Experiment Ontology">
                                    {/*
                                    experiment_ontology is accidentally an array in Katsu, so this takes the first item
                                    and falls back to just the field (if we fix this in the future)
                                    */}
                                    <OntologyTerm
                                        individual={individual}
                                        term={e.experiment_ontology?.[0] ?? e.experiment_ontology}
                                    />
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
                                        <Descriptions.Item label="ID">
                                            <span style={{fontFamily: "monospace"}}>{e.id}</span>
                                        </Descriptions.Item>
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
                                            <JsonView inputJson={e.extra_properties} />
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                        <Descriptions
                            title={`${e.experiment_type} - Results`}
                            bordered={true}
                        />
                        <Table
                            // bordered
                            size="small"
                            pagination={false}
                            columns={EXPERIMENT_RESULTS_COLUMNS}
                            rowKey="filename"
                            dataSource={(e.experiment_results || []).sort(
                                (r1, r2) =>
                                    r1.file_format > r2.file_format ? 1 : -1,
                            )}
                        />
                    </div>
                </Panel>
            ))}
        </Collapse>
    );
};

// expand here accordingly
const isDownloadable = (result) =>
    ["vcf", "cram", "bw", "bigwig"].includes(result.file_format?.toLowerCase());

IndividualExperiments.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualExperiments;
