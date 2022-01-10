import React from "react";
import { useSelector } from "react-redux";
import {parse} from "iso8601-duration";
import {Col, Divider, Modal, Row, Statistic, Typography} from "antd";
import CustomPieChart from "../overview/CustomPieChart";
import Histogram from "../overview/Histogram";
import {KARYOTYPIC_SEX_VALUES, SEX_VALUES} from "../../dataTypes/phenopacket";
import {explorerSearchResultsPropTypesShape} from "../../propTypes";
import {mapNameValueFields} from "../../utils/mapNameValueFields"
import {DEFAULT_OTHER_THRESHOLD_PERCENTAGE} from "../../constants"

const CHART_HEIGHT = 300;
const CHART_ASPECT_RATIO = 1.8;

const SearchSummaryModal = ({searchResults, ...props}) => {
    const otherThresholdPercentage = JSON.parse(localStorage.getItem("otherThresholdPercentage")) ?? DEFAULT_OTHER_THRESHOLD_PERCENTAGE;    
    const searchFormattedResults = searchResults.searchFormattedResults || [];
    const experiments = searchResults?.results?.results?.experiment || [];

    const histogramFormat = (ageCounts) => {

        // only show age 110+ if present
        if (!ageCounts[110]) {
            delete ageCounts[110];
        }

        return Object.keys(ageCounts).map(age => {
            return {ageBin: age, count: ageCounts[age]};
        });
    };

    const ageBinCounts = {
        0: 0,
        10: 0,
        20: 0,
        30: 0,
        40: 0,
        50: 0,
        60: 0,
        70: 0,
        80: 0,
        90: 0,
        100: 0,
        110: 0,
    };

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

        // handles age.age only, age.start and age.end are ignored
        if (r.individual.age) {
            const {age} = r.individual.age;
            if (age) {
                const ageBin = 10 * Math.floor(parse(age).years / 10);
                ageBinCounts[ageBin] += 1;
            }
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

    const sexPieChartData = mapNameValueFields(numIndividualsBySex, otherThresholdPercentage / 100);
    const ageHistogramData = histogramFormat(ageBinCounts);
    const phenotypicFeaturesData = mapNameValueFields(numPhenoFeatsByType, otherThresholdPercentage / 100);
    const diseasesData = mapNameValueFields(numDiseasesByTerm, otherThresholdPercentage / 100);

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
        <Divider/>

        {(sexPieChartData.length > 0) ? <>

            <Typography.Title level={4}>Overview: Individuals</Typography.Title>
            <Row gutter={16}>
                <Col span={12} style={{ textAlign: "center" }} >
                <CustomPieChart
                  title="Sex"
                  data={sexPieChartData}
                  chartHeight={CHART_HEIGHT}
                  chartAspectRatio={CHART_ASPECT_RATIO}
                />
                </Col>
                {Boolean(diseasesData.length) && <Col span={12} style={{ textAlign: "center" }} >
                <CustomPieChart
                  title="Diseases"
                  data={diseasesData}
                  chartHeight={CHART_HEIGHT}
                  chartAspectRatio={CHART_ASPECT_RATIO}
                />
                </Col>}
                {Boolean(phenotypicFeaturesData.length) && <Col span={12} style={{ textAlign: "center" }} >
                <CustomPieChart
                  title="Phenotypic Features"
                  data={phenotypicFeaturesData}
                  chartHeight={CHART_HEIGHT}
                  chartAspectRatio={CHART_ASPECT_RATIO}
                />
                </Col>}
                <Col span={12} style={{ textAlign: "center" }} >
                <Histogram
                  title="Ages"
                  data={ageHistogramData}
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
