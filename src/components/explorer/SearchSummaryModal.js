import React, { useEffect, useState } from "react";
import { Col, Divider, Modal, Row, Statistic, Typography } from "antd";
import CustomPieChart from "../overview/CustomPieChart";
import Histogram from "../overview/Histogram";
import { explorerSearchResultsPropTypesShape } from "../../propTypes";
import { useSelector } from "react-redux";

const CHART_HEIGHT = 300;
const CHART_ASPECT_RATIO = 1.8;
const MODAL_WIDTH = 1000;

const serializePieChartData = (data) => Object.entries(data).map(([key, value]) => ({ name: key, value }));
const serializeBarChartData = (data) => Object.entries(data).map(([key, value]) => ({ ageBin: key, count: value }));


const SearchSummaryModal = ({ searchResults, ...props }) => {
    const [data, setData] = useState(null);

    const katsuUrl = useSelector((state) => state.services.itemsByArtifact.metadata.url);

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const ids = searchResults.results.results.map(({ subject_id }) => subject_id);

        const raw = JSON.stringify({
            id: ids,
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        fetch(`${katsuUrl}/api/search_overview`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                setData(result);
                console.log("what i got", result);
            })
            .catch((error) => console.log("error", error));
    }, [searchResults]);
    // return <div>hi</div>
    return data ? (
        <Modal title="Search Results" {...props} width={MODAL_WIDTH} footer={null} style={{ padding: "10px" }}>
            <Row gutter={16} style={{ display: "flex", flexWrap: "wrap" }}>
                <Col span={7}>
                    <Statistic title="Individuals" value={data.individuals.count} />
                </Col>
                <Col span={7}>
                    <Statistic title="Biosamples" value={data.biosamples.count} />
                </Col>
                <Col span={7}>
                    <Statistic title="Experiments" value={data.experiments.count} />
                </Col>
            </Row>
            <Divider />
            <>
                <Typography.Title level={4}>Individuals</Typography.Title>
                <Row gutter={[0, 16]}>
                    <Col span={12} style={{ textAlign: "center" }}>
                        <CustomPieChart
                            title="Sex"
                            data={serializePieChartData(data.individuals.sex)}
                            chartHeight={CHART_HEIGHT}
                            chartAspectRatio={CHART_ASPECT_RATIO}
                        />
                    </Col>
                    <Col span={12} style={{ textAlign: "center" }}>
                        <CustomPieChart
                            title="Diseases"
                            data={serializePieChartData(data.diseases.term)}
                            chartHeight={CHART_HEIGHT}
                            chartAspectRatio={CHART_ASPECT_RATIO}
                        />
                    </Col>
                    <Col span={12} style={{ textAlign: "center" }}>
                        <CustomPieChart
                            title="Phenotypic Features"
                            data={serializePieChartData(data.phenotypic_features.type)}
                            chartHeight={CHART_HEIGHT}
                            chartAspectRatio={CHART_ASPECT_RATIO}
                        />
                    </Col>
                    <Col span={12} style={{ textAlign: "center" }}>
                        <Histogram
                            title="Ages"
                            data={serializeBarChartData(data.individuals.age)}
                            chartHeight={CHART_HEIGHT}
                            chartAspectRatio={CHART_ASPECT_RATIO}
                        />
                    </Col>
                </Row>
                <Divider />
                <Typography.Title level={4}>Biosamples</Typography.Title>
                <Row gutter={[0, 16]}>
                    <Col span={12} style={{ textAlign: "center" }}>
                        <CustomPieChart
                            title="Biosamples by Tissue"
                            data={serializePieChartData(data.biosamples.sampled_tissue)}
                            chartHeight={CHART_HEIGHT}
                            chartAspectRatio={CHART_ASPECT_RATIO}
                        />
                    </Col>
                    <Col span={12} style={{ textAlign: "center" }}>
                        <CustomPieChart
                            title="Biosamples by Diagnosis"
                            data={serializePieChartData(data.biosamples.histological_diagnosis)}
                            chartHeight={CHART_HEIGHT}
                            chartAspectRatio={CHART_ASPECT_RATIO}
                        />
                    </Col>
                </Row>
                <Divider />
                <Typography.Title level={4}>Experiments</Typography.Title>
                <Row gutter={[0, 16]}>
                    <Col span={12} style={{ textAlign: "center" }}>
                        <CustomPieChart
                            title="Study Types"
                            data={serializePieChartData(data.experiments.experiment_type)}
                            chartHeight={CHART_HEIGHT}
                            chartAspectRatio={CHART_ASPECT_RATIO}
                        />
                    </Col>
                </Row>
            </>
        </Modal>
    ) : null;
};

SearchSummaryModal.propTypes = {
    searchResults: explorerSearchResultsPropTypesShape,
};

export default SearchSummaryModal;