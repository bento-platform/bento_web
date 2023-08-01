/* eslint-disable camelcase */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Col, Divider, Modal, Row, Skeleton, Statistic, Typography } from "antd";
import PieChart from "../charts/PieChart";
import Histogram from "../charts/Histogram";

import { useAuthorizationHeader } from "../../lib/auth/utils";
import { explorerSearchResultsPropTypesShape } from "../../propTypes";

const CHART_HEIGHT = 300;
const MODAL_WIDTH = 1000;

const serializePieChartData = (data) => Object.entries(data).map(([key, value]) => ({ name: key, value }));
const serializeBarChartData = (data) => Object.entries(data).map(([key, value]) => ({ ageBin: key, count: value }));

const createChart = (chartData) => {
    const { type, title, data, ...rest } = chartData;

    switch (type) {
        case "PieChart":
            return (
                <PieChart
                    title={title}
                    data={serializePieChartData(data)}
                    chartHeight={CHART_HEIGHT}
                    {...rest}
                />
            );
        case "BarChart":
            return (
                <Histogram
                    title={title}
                    data={serializeBarChartData(data)}
                    chartHeight={CHART_HEIGHT}
                    {...rest}
                />
            );
        default:
            return null;
    }
};

const renderCharts = (chartsData) => {
    return chartsData.map((chartData, index) => (
        <Col key={index} span={12} style={{ textAlign: "center" }}>
            {createChart(chartData)}
        </Col>
    ));
};

const SearchSummaryModal = ({ searchResults, ...props }) => {
    const [data, setData] = useState(null);

    const katsuUrl = useSelector((state) => state.services.itemsByArtifact.metadata.url);
    const authorizationHeader = useAuthorizationHeader();

    useEffect(() => {
        const ids = searchResults.searchFormattedResults.map(({ key }) => key);

        const raw = JSON.stringify({
            id: ids,
        });

        const requestOptions = {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json", ...authorizationHeader}),
            body: raw,
            redirect: "follow",
        };

        fetch(`${katsuUrl}/api/search_overview`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                setData(result);
            })
            .catch((error) => console.error("error", error));
    }, [searchResults]);

    const individualsCharts = [
        {
            type: "PieChart",
            title: "Sex",
            data: data?.individuals?.sex,
        },
        {
            type: "PieChart",
            title: "Diseases",
            data: data?.diseases?.term,
        },
        {
            type: "PieChart",
            title: "Phenotypic Features",
            data: data?.phenotypic_features?.type,
        },
        {
            type: "BarChart",
            title: "Ages",
            data: data?.individuals?.age,
        },
    ];

    const biosamplesCharts = [
        {
            type: "PieChart",
            title: "Biosamples by Tissue",
            data: data?.biosamples?.sampled_tissue,
        },
        {
            type: "PieChart",
            title: "Biosamples by Diagnosis",
            data: data?.biosamples?.histological_diagnosis,
        },
    ];

    const experimentsCharts = [
        {
            type: "PieChart",
            title: "Experiment Types",
            data: data?.experiments?.experiment_type,
        },
    ];

    return (
        <Modal title="Search Results" {...props} width={MODAL_WIDTH} footer={null} style={{ padding: "10px" }}>
            {data ? (
                <>
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
                        <Row gutter={[0, 16]}>{renderCharts(individualsCharts)}</Row>
                        <Divider />
                        <Typography.Title level={4}>Biosamples</Typography.Title>
                        <Row gutter={[0, 16]}>{renderCharts(biosamplesCharts)}</Row>
                        <Divider />
                        <Typography.Title level={4}>Experiments</Typography.Title>
                        <Row gutter={[0, 16]}>{renderCharts(experimentsCharts)}</Row>
                    </>
                </>
            ) : (
                <Skeleton active />
            )}
        </Modal>
    );
};

SearchSummaryModal.propTypes = {
    searchResults: explorerSearchResultsPropTypesShape,
};

export default SearchSummaryModal;
