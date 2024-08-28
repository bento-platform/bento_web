import { useEffect, useState } from "react";
import { useAuthorizationHeader } from "bento-auth-js";

import { Col, Divider, Modal, Row, Skeleton, Statistic, Typography } from "antd";
import PieChart from "../charts/PieChart";
import Histogram from "../charts/Histogram";

import { explorerSearchResultsPropTypesShape } from "@/propTypes";
import { useService } from "@/modules/services/hooks";

const CHART_HEIGHT = 300;
const MODAL_WIDTH = 1000;

const serializePieChartData = (data) => Object.entries(data).map(([key, value]) => ({ name: key, value }));
const serializeBarChartData = (data) => Object.entries(data).map(([key, value]) => ({ ageBin: key, count: value }));

const createChart = (chartData) => {
  const { type, title, data, ...rest } = chartData;

  switch (type) {
    case "PieChart":
      return <PieChart title={title} data={serializePieChartData(data)} chartHeight={CHART_HEIGHT} {...rest} />;
    case "BarChart":
      return <Histogram title={title} data={serializeBarChartData(data)} chartHeight={CHART_HEIGHT} {...rest} />;
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

  const katsuUrl = useService("metadata")?.url;
  const authorizationHeader = useAuthorizationHeader();

  useEffect(() => {
    if (!katsuUrl) return;

    const ids = searchResults.searchFormattedResults.map(({ key }) => key);

    const raw = JSON.stringify({
      id: ids,
    });

    const requestOptions = {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json", ...authorizationHeader }),
      body: raw,
      redirect: "follow",
    };

    fetch(`${katsuUrl}/api/search_overview`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setData(result);
      })
      .catch((error) => console.error("error", error));
  }, [katsuUrl, searchResults, authorizationHeader]);

  const phenopacketData = data?.phenopacket?.data_type_specific;
  const experimentData = data?.experiment?.data_type_specific;

  const individualsCharts = [
    {
      type: "PieChart",
      title: "Sex",
      data: phenopacketData?.individuals?.sex,
    },
    {
      type: "PieChart",
      title: "Diseases",
      data: phenopacketData?.diseases?.term,
    },
    {
      type: "PieChart",
      title: "Phenotypic Features",
      data: phenopacketData?.phenotypic_features?.type,
    },
    {
      type: "BarChart",
      title: "Ages",
      data: phenopacketData?.individuals?.age,
    },
  ];

  const biosamplesCharts = [
    {
      type: "PieChart",
      title: "Biosamples by Tissue",
      data: phenopacketData?.biosamples?.sampled_tissue,
    },
    {
      type: "PieChart",
      title: "Biosamples by Diagnosis",
      data: phenopacketData?.biosamples?.histological_diagnosis,
    },
  ];

  const experimentsCharts = [
    {
      type: "PieChart",
      title: "Experiment Types",
      data: experimentData?.experiments?.experiment_type,
    },
  ];

  return (
    <Modal title="Search Results" {...props} width={MODAL_WIDTH} footer={null} style={{ padding: "10px" }}>
      {data ? (
        <>
          <Row gutter={16} style={{ display: "flex", flexWrap: "wrap" }}>
            <Col span={7}>
              <Statistic title="Individuals" value={phenopacketData.individuals.count} />
            </Col>
            <Col span={7}>
              <Statistic title="Biosamples" value={phenopacketData.biosamples.count} />
            </Col>
            <Col span={7}>
              <Statistic title="Experiments" value={experimentData.experiments.count} />
            </Col>
          </Row>
          <Divider />
          <>
            <Typography.Title level={4}>Individuals</Typography.Title>
            <Row>{renderCharts(individualsCharts)}</Row>
            <Divider />
            <Typography.Title level={4}>Biosamples</Typography.Title>
            <Row>{renderCharts(biosamplesCharts)}</Row>
            <Divider />
            <Typography.Title level={4}>Experiments</Typography.Title>
            <Row>{renderCharts(experimentsCharts)}</Row>
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
