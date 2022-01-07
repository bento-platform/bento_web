import React from "react";
import {parse} from "iso8601-duration";
import {Col, Divider, Modal, Row, Statistic, Typography} from "antd";
import CustomPieChart from "../overview/CustomPieChart";
import Histogram from "../overview/Histogram";
import {KARYOTYPIC_SEX_VALUES, SEX_VALUES} from "../../dataTypes/phenopacket";
import {explorerSearchResultsPropTypesShape} from "../../propTypes";


const CHART_HEIGHT = 300;
const CHART_ASPECT_RATIO = 1.8;

const SearchSummaryModal = ({searchResults, ...props}) => {

    const searchFormattedResults = searchResults.searchFormattedResults || [];
    const experiments = searchResults?.results?.results?.experiment || [];

    const pieChartFormat = (obj) => {
        return Object.keys(obj).map(k => ({"name": k, "value": obj[k]}));
    }

    // Individuals summary
    const numIndividualsBySex = Object.fromEntries(SEX_VALUES.map(v => [v, 0]));

    // - Phenotypic features summary
    const numPhenoFeatsByType = {};

    // - Individuals' diseases summary - from phenopackets
    const numDiseasesByTerm = {};

    // Biosamples summary
    // TODO: More ontology aware

    const numSamplesByTissue = {};
    const numSamplesByHistologicalDiagnosis = {};

    const ageAtCollectionHistogram = [];

    searchFormattedResults.forEach(r => {
        if (r.individual) {
            numIndividualsBySex[r.individual.sex]++;
        }

        (r.phenotypic_features || []).forEach(pf => {
            // TODO: Better ontology awareness - label vs id, translation, etc.
            numPhenoFeatsByType[pf.type.label] = (numPhenoFeatsByType[pf.type.label] || 0) + 1;
        });

        (r.diseases || []).forEach(d => {
            // TODO: Better ontology awareness - label vs id, translation, etc.
            numDiseasesByTerm[d.term.label] = (numDiseasesByTerm[d.term.label] || 0) + 1;
        });

        (r.biosamples || []).forEach(b => {
            const tissueKey = (b.sampled_tissue || {}).label || "N/A";
            const histDiagKey = (b.histological_diagnosis || {}).label || "N/A";
            numSamplesByTissue[tissueKey] = (numSamplesByTissue[tissueKey] || 0) + 1;
            numSamplesByHistologicalDiagnosis[histDiagKey] = (numSamplesByHistologicalDiagnosis[histDiagKey] || 0) + 1;
        });
    });
q

    const sexPieChart = pieChartFormat(numIndividualsBySex)

    return searchResults ? <Modal title="Search Results" {...props} width={960} footer={null}>
        <Row gutter={16}>
            <Col span={7}>
                <Statistic title="Individuals" value={searchFormattedResults.length} />
            </Col>
            <Col span={7}>
                <Statistic title="Biosamples"
                           value={searchFormattedResults
                               .map(i => (i.biosamples || []).length)
                               .reduce((s, v) => s + v, 0)} />
            </Col>
            <Col span={7}>
            <Statistic title="Experiments" value={experiments.length} />
            </Col>

        </Row>
        <Divider />
        <CustomPieChart
                  title="Diseases"
                  data={[]}
                  chartHeight={50}
                  chartAspectRatio={4}
                />
        <Divider />

        {(sexPieChart.length > 0) ? <>

            <Typography.Title level={4}>Overview: Individuals</Typography.Title>
            <Row gutter={16}>
                <Col span={12} style={{ textAlign: "center" }} >
                <CustomPieChart
                  title="Sex"
                  data={sexPieChart}
                  chartHeight={CHART_HEIGHT}
                  chartAspectRatio={CHART_ASPECT_RATIO}
                />
                </Col>
            </Row>
        </> : null}

    </Modal> : null;
};

SearchSummaryModal.propTypes = {
    searchResults: explorerSearchResultsPropTypesShape,
};

export default SearchSummaryModal;
