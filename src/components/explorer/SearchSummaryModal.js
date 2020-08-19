import React from "react";

import {parse, toSeconds} from "iso8601-duration";

import {Col, Divider, Modal, Row, Statistic, Typography} from "antd";
import "antd/es/col/style/css";
import "antd/es/divider/style/css";
import "antd/es/modal/style/css";
import "antd/es/row/style/css";
import "antd/es/statistic/style/css";

import {VictoryAxis, VictoryBar, VictoryChart, VictoryHistogram, VictoryLabel, VictoryPie} from "victory";
import VictoryPieWrapSVG from "../VictoryPieWrapSVG";

import {KARYOTYPIC_SEX_VALUES, SEX_VALUES} from "../../dataTypes/phenopacket";
import {
    VICTORY_BAR_CONTAINER_PROPS,
    VICTORY_BAR_PROPS,
    VICTORY_BAR_TITLE_PROPS,
    VICTORY_HIST_CONTAINER_PROPS,
    VICTORY_HIST_PROPS,
    VICTORY_PIE_LABEL_PROPS,
    VICTORY_PIE_PROPS,
} from "../../styles/victory";
import {explorerSearchResultsPropTypesShape} from "../../propTypes";


const numObjectToVictoryArray = numObj => Object.entries(numObj)
    .filter(e => e[1] > 0)
    .map(([x, y]) => ({x, y}));


// Bins of 10 years
// TODO: Deal with start/end - for now, weight based on bin overlap?
const AGE_HISTOGRAM_BINS = [...Array(10).keys()].map(i => i * 10);


const ageAndDOBToApproxYears = (age, dob=null) => {
    const parsedAge = parse(age);
    const parsedAgeSeconds = toSeconds(parsedAge, dob);
    // Convert # of seconds to "normalized" years TODO: Sketchy logic
    return parsedAgeSeconds / (60 * 60 * 24 * 365.2422);
}


const SearchSummaryModal = ({searchResults, ...props}) => {
    const searchFormattedResults = searchResults.searchFormattedResults || [];

    console.log(searchFormattedResults);

    // Individuals summary

    const numIndividualsBySex = Object.fromEntries(SEX_VALUES.map(v => [v, 0]));
    const numIndividualsByKaryotype = Object.fromEntries(KARYOTYPIC_SEX_VALUES.map(v => [v, 0]));

    // - Individuals' diseases summary - from phenopackets
    const numDiseasesByTerm = {};

    // Biosamples summary
    // TODO: More ontology aware

    const numSamplesByTissue = {};
    const numSamplesByTaxonomy = {};
    const numSamplesByHistologicalDiagnosis = {};

    const ageAtCollectionHistogram = [];

    searchFormattedResults.forEach(r => {
        if (r.individual) {
            numIndividualsBySex[r.individual.sex]++;
            numIndividualsByKaryotype[r.individual.karyotypic_sex]++;
        }

        (r.diseases || []).forEach(d => {
            // TODO: Better ontology awareness - label vs id, translation, etc.
            numDiseasesByTerm[d.term.label] = (numDiseasesByTerm[d.term.label] || 0) + 1;
        });

        (r.biosamples || []).forEach(b => {
            const tissueKey = (b.sampled_tissue || {}).label || "N/A";
            const taxonomyKey = (b.taxonomy || {}).label || "N/A";
            const histDiagKey = (b.histological_diagnosis || {}).label || "N/A";
            numSamplesByTissue[tissueKey] = (numSamplesByTissue[tissueKey] || 0) + 1;
            numSamplesByTaxonomy[taxonomyKey] = (numSamplesByTaxonomy[taxonomyKey] || 0) + 1;
            numSamplesByHistologicalDiagnosis[histDiagKey] = (numSamplesByHistologicalDiagnosis[histDiagKey] || 0) + 1;

            if (b.individual_age_at_collection) {
                let individualBirth = (r.individual || {}).date_of_birth;
                if (individualBirth) {
                    individualBirth = new Date(Date.parse(individualBirth));
                }

                const {age, start, end} = b.individual_age_at_collection;
                if (age) {
                    ageAtCollectionHistogram.push({x: ageAndDOBToApproxYears(age, individualBirth)});
                } else if (start.age && end.age) {
                    const startYears = ageAndDOBToApproxYears(start.age, individualBirth);
                    const endYears = ageAndDOBToApproxYears(end.age, individualBirth);

                    // Push average of years TODO: Better bin calculation?
                    ageAtCollectionHistogram.push({x: (startYears + endYears) / 2});
                }
            }
        })
    });

    const individualsBySex = numObjectToVictoryArray(numIndividualsBySex);
    const individualsByKaryotype = numObjectToVictoryArray(numIndividualsByKaryotype);
    const diseasesByTerm = numObjectToVictoryArray(numDiseasesByTerm);
    const samplesByTissue = numObjectToVictoryArray(numSamplesByTissue);
    const samplesByTaxonomy = numObjectToVictoryArray(numSamplesByTaxonomy);

    // TODO: Procedures: account for both code and (if specified) body_site
    //  e.g. "Biopsy" or "Biopsy on X body site" - maybe stacked bar or grouped bar chart?

    return searchResults ? <Modal title="Search Results" {...props} width={960} footer={null}>
        <Row gutter={16}>
            <Col span={12}>
                <Statistic title="Individuals" value={searchFormattedResults.length} />
            </Col>
            <Col span={12}>
                <Statistic title="Biosamples"
                           value={searchFormattedResults
                               .map(i => (i.biosamples || []).length)
                               .reduce((s, v) => s + v, 0)} />
            </Col>
        </Row>
        {(individualsBySex.length > 0 && individualsByKaryotype.length > 0) ? <>
            {/* TODO: Deduplicate with phenopacket summary */}
            <Divider />
            <Typography.Title level={4}>Overview: Individuals</Typography.Title>
            <Row gutter={16}>
                <Col span={12}>
                    <VictoryPieWrapSVG>
                        <VictoryPie data={individualsBySex} {...VICTORY_PIE_PROPS} />
                        <VictoryLabel text="SEX" {...VICTORY_PIE_LABEL_PROPS} />
                    </VictoryPieWrapSVG>
                </Col>
                <Col span={12}>
                    <VictoryPieWrapSVG>
                        <VictoryPie data={individualsByKaryotype} {...VICTORY_PIE_PROPS} />
                        <VictoryLabel text="KARYOTYPE" {...VICTORY_PIE_LABEL_PROPS} />
                    </VictoryPieWrapSVG>
                </Col>
                <Col span={12}>
                    <VictoryChart {...VICTORY_BAR_CONTAINER_PROPS}>
                        <VictoryAxis tickLabelComponent={<VictoryLabel dy={-5} />} style={{
                            tickLabels: {
                                angle: -40,
                                fontFamily: "monospace",
                                fontSize: "11px",
                                textAnchor: "end",
                                letterSpacing: "-1.5px"
                            },
                        }} />
                        <VictoryBar data={diseasesByTerm} {...VICTORY_BAR_PROPS} />
                        <VictoryLabel text="DISEASE" {...VICTORY_BAR_TITLE_PROPS} />
                    </VictoryChart>
                </Col>
            </Row>
        </> : null}
        {samplesByTissue.length > 0 ? <>
            {/* TODO: Deduplicate with phenopacket summary */}
            <Divider />
            <Typography.Title level={4}>Overview: Biosamples</Typography.Title>
            <Row gutter={16}>
                <Col span={12}>
                    <VictoryPieWrapSVG>
                        <VictoryPie data={samplesByTissue} {...VICTORY_PIE_PROPS} />
                        <VictoryLabel text="TISSUE" {...VICTORY_PIE_LABEL_PROPS} />
                    </VictoryPieWrapSVG>
                </Col>
                <Col span={12}>
                    <VictoryPieWrapSVG>
                        <VictoryPie data={samplesByTaxonomy} {...VICTORY_PIE_PROPS} />
                        <VictoryLabel text="TAXONOMY" {...VICTORY_PIE_LABEL_PROPS} />
                    </VictoryPieWrapSVG>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <VictoryChart {...VICTORY_HIST_CONTAINER_PROPS}>
                        <VictoryAxis tickValues={AGE_HISTOGRAM_BINS}
                                     label="Age (Years)"
                                     height={200}
                                     style={{
                                         axisLabel: {fontFamily: "monospace"},
                                         tickLabels: {fontFamily: "monospace"}
                                     }} />
                        <VictoryAxis dependentAxis={true}
                                     label="Count"
                                     style={{
                                         axisLabel: {fontFamily: "monospace"},
                                         tickLabels: {fontFamily: "monospace"}
                                     }} />
                        <VictoryHistogram data={ageAtCollectionHistogram}
                                          bins={AGE_HISTOGRAM_BINS}
                                          {...VICTORY_HIST_PROPS} />
                        <VictoryLabel text="AGE AT COLLECTION" {...VICTORY_BAR_TITLE_PROPS} />
                    </VictoryChart>
                </Col>
                <Col span={12}>
                    {/* TODO: histological_diagnosis pie chart */}
                </Col>
            </Row>
        </> : null}
    </Modal> : null;
};

SearchSummaryModal.propTypes = {
    searchResults: explorerSearchResultsPropTypesShape,
};

export default SearchSummaryModal;
