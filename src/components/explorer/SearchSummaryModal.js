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
    const thresholdProportion = otherThresholdPercentage/100
    const searchFormattedResults = searchResults.searchFormattedResults || [];

    // this doesn't work, many searches incorrectly return all experiments instead of a subset
    // const experiments = searchResults?.results?.results?.experiment || [];

    // instead pull experiments from phenopackets
    const experiments = searchFormattedResults.flatMap(r => r.experiments)

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

    // Experiments summary 
    const numExperimentsByType = {}

    searchFormattedResults.forEach(r => {
        if (r.individual) {
            numIndividualsBySex[r.individual.sex]++;
        }

        // handles age.age only, age.start and age.end are ignored
        if (r.individual.age) {
            const {age} = r.individual.age;
            if (age) {
                const ageBin = 10 * Math.floor(parse(age).years / 10);
                if (ageBin < 0 || ageBin > 110) {
                    console.error(`age out of range: ${age}`);
                } else {
                    ageBinCounts[ageBin] += 1;
                }
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

        (r.experiments || []).forEach(e => {
            numExperimentsByType[e.experiment_type] = (numExperimentsByType[e.experiment_type] || 0) + 1;
        });
    });

    const sexPieChartData = mapNameValueFields(numIndividualsBySex, thresholdProportion);
    const sexDataNonEmpty = sexPieChartData.some(s => s.value > 0);
    const ageHistogramData = histogramFormat(ageBinCounts);
    const histogramHasData = ageHistogramData.some(a => a.count > 0);
    const phenotypicFeaturesData = mapNameValueFields(numPhenoFeatsByType, thresholdProportion);
    const diseasesData = mapNameValueFields(numDiseasesByTerm, thresholdProportion);
    const biosamplesByTissueData = mapNameValueFields(numSamplesByTissue, thresholdProportion);
    const biosamplesByHistologicalDiagnosisData = mapNameValueFields(numSamplesByHistologicalDiagnosis, thresholdProportion);
    const experimentsByTypeData = mapNameValueFields(numExperimentsByType, thresholdProportion)

    return searchResults ? (
      <Modal title="Search Results" {...props} width={960} footer={null}>
        <Row gutter={16}>
          <Col span={7}>
            <Statistic title="Individuals" value={searchFormattedResults.length} />
          </Col>
          <Col span={7}>
            <Statistic
              title="Biosamples"
              value={searchFormattedResults
                .map((i) => (i.biosamples || []).length)
                .reduce((s, v) => s + v, 0)}
            />
          </Col>
          <Col span={7}>
            <Statistic title="Experiments" value={experiments.length} />
          </Col>
        </Row>
        <Divider />
          <>
            <Typography.Title level={4}>Individuals</Typography.Title>
            <Row gutter={16}>
              {sexDataNonEmpty && <Col span={12} style={{ textAlign: "center" }}>
                <CustomPieChart
                  title="Sex"
                  data={sexPieChartData}
                  chartHeight={CHART_HEIGHT}
                  chartAspectRatio={CHART_ASPECT_RATIO}
                />
              </Col>}
              {Boolean(diseasesData.length) && (
                <Col span={12} style={{ textAlign: "center" }}>
                  <CustomPieChart
                    title="Diseases"
                    data={diseasesData}
                    chartHeight={CHART_HEIGHT}
                    chartAspectRatio={CHART_ASPECT_RATIO}
                  />
                </Col>
              )}
              {Boolean(phenotypicFeaturesData.length) && (
                <Col span={12} style={{ textAlign: "center" }}>
                  <CustomPieChart
                    title="Phenotypic Features"
                    data={phenotypicFeaturesData}
                    chartHeight={CHART_HEIGHT}
                    chartAspectRatio={CHART_ASPECT_RATIO}
                  />
                </Col>
              )}
              {histogramHasData && <Col span={12} style={{ textAlign: "center" }}>
                <Histogram
                  title="Ages"
                  data={ageHistogramData}
                  chartHeight={CHART_HEIGHT}
                  chartAspectRatio={CHART_ASPECT_RATIO}
                />
              </Col>}
            </Row>
            <Divider />
            <Typography.Title level={4}>Biosamples</Typography.Title>
            <Row gutter={16}>
              {Boolean(biosamplesByTissueData.length) && (
                <Col span={12} style={{ textAlign: "center" }}>
                  <CustomPieChart
                    title="Biosamples by Tissue"
                    data={biosamplesByTissueData}
                    chartHeight={CHART_HEIGHT}
                    chartAspectRatio={CHART_ASPECT_RATIO}
                  />
                </Col>
              )}
              {Boolean(biosamplesByHistologicalDiagnosisData.length) && (
                <Col span={12} style={{ textAlign: "center" }}>
                  <CustomPieChart
                    title="Biosamples by Diagnosis"
                    data={biosamplesByHistologicalDiagnosisData}
                    chartHeight={CHART_HEIGHT}
                    chartAspectRatio={CHART_ASPECT_RATIO}
                  />
                </Col>
              )}
            </Row>
                <Divider />
                <Typography.Title level={4}>Experiments</Typography.Title>
                <Row gutter={16}>
                {Boolean(experimentsByTypeData.length) && (
                <Col span={12} style={{ textAlign: "center" }}>
                  <CustomPieChart
                    title="Study Types"
                    data={experimentsByTypeData}
                    chartHeight={CHART_HEIGHT}
                    chartAspectRatio={CHART_ASPECT_RATIO}
                  />
                </Col>
              )}
                </Row>
          </>
      </Modal>
    ) : null;
};

SearchSummaryModal.propTypes = {
    searchResults: explorerSearchResultsPropTypesShape,
};

export default SearchSummaryModal;
