import React from "react";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";
import { Button, Descriptions, Empty } from "antd";

import { useIndividualResources, useIndividualInterpretations } from "./utils";
import "./explorer.css";
import { individualPropTypesShape, resourcePropTypesShape } from "../../propTypes";
import OntologyTerm from "./OntologyTerm";

const createdAndUpdatedDescriptions = (data) => {
    const descriptions = [];
    if ("created" in data) {
        descriptions.push(<Descriptions.Item label="Created" key={"created"}>{data.created}</Descriptions.Item>);
    }

    if ("updated" in data) {
        descriptions.push(<Descriptions.Item label="Updated" key={"updated"}>{data.updated}</Descriptions.Item>);
    }
    return descriptions;
};

export const VariantInterpretation = ({variationInterpretation, variantsUrl}) => {
    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label={"ACMG Pathogenicity classification"}>
                {variationInterpretation.acmg_pathogenicity_classification}
            </Descriptions.Item>
            <Descriptions.Item label={"Therapeutic Actionability"}>
                {variationInterpretation.therapeutic_actionability}
            </Descriptions.Item>
            <Descriptions.Item label={"Variant Descriptor"}>
                <Link to={{ pathname: variantsUrl}}>
                    <Button>{variationInterpretation.variation_descriptor.id}</Button>
                </Link>
            </Descriptions.Item>
        </Descriptions>
    );
};
VariantInterpretation.propTypes = {
    variationInterpretation: PropTypes.object,
    variantsUrl: PropTypes.string,
};

export const GenomicInterpretation = ({genomicInterpretation, variantsUrl, genesUrl}) => {
    const relatedType = genomicInterpretation?.extra_properties?.related_type ?? "unknown";
    const relatedLabel = relatedType[0].toUpperCase() + relatedType.slice(1).toLowerCase();

    const variantInterpretation = genomicInterpretation?.variant_interpretation;
    const geneDescriptor = genomicInterpretation?.gene_descriptor;

    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label="ID">{genomicInterpretation.id}</Descriptions.Item>
            <Descriptions.Item label={`${relatedLabel} ID`}>
                {genomicInterpretation.subject_or_biosample_id}
            </Descriptions.Item>
            <Descriptions.Item label={"Interpretation Status"}>
                {genomicInterpretation.interpretation_status}
            </Descriptions.Item>
            {createdAndUpdatedDescriptions(genomicInterpretation)}
            {variantInterpretation && <Descriptions.Item label={"Variant Interpretation"}>
                <VariantInterpretation variationInterpretation={variantInterpretation} variantsUrl={variantsUrl}/>
            </Descriptions.Item>}
            {geneDescriptor && <Descriptions.Item label="Gene Descriptor">
                {/* TODO: GeneDescriptor component */}
            </Descriptions.Item>}
        </Descriptions>
    );
};
GenomicInterpretation.propTypes = {
    genomicInterpretation: PropTypes.object,
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
};


const Diagnosis = ({diagnosis, resourcesTuple, variantsUrl, genesUrl}) => {
    const genomicInterpretations = diagnosis?.genomic_interpretations ?? [];
    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label="Disease">
                <OntologyTerm resourcesTuple={resourcesTuple} term={diagnosis.disease_ontology}/>
            </Descriptions.Item>
            {genomicInterpretations.length ? (
                <Descriptions.Item label="Genomic Interpretations">
                    {genomicInterpretations.map(gi =>
                        <GenomicInterpretation key={gi.id}
                                               genomicInterpretation={gi}
                                               variantsUrl={variantsUrl}/>,
                    )}
                </Descriptions.Item>
            ) : null}
        </Descriptions>
    );
};
Diagnosis.propTypes = {
    diagnosis: PropTypes.object,
    resourcesTuple: resourcePropTypesShape,
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
};

const Interpretation = ({interpretation, resourcesTuple, variantsUrl, genesUrl}) => {
    return (<Descriptions layout="horizontal" bordered={true} column={1} size="small">
        <Descriptions.Item label="ID">{interpretation.id}</Descriptions.Item>
        {createdAndUpdatedDescriptions(interpretation)}
        <Descriptions.Item label="Progress Status">{interpretation.progress_status}</Descriptions.Item>
        <Descriptions.Item label="Summary">{interpretation.summary}</Descriptions.Item>
        <Descriptions.Item label="Diagnosis">
            <Diagnosis diagnosis={interpretation.diagnosis} resourcesTuple={resourcesTuple} variantsUrl={variantsUrl}/>
        </Descriptions.Item>
    </Descriptions>);
};
Interpretation.propTypes = {
    interpretation: PropTypes.object,
    resourcesTuple: PropTypes.array,
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
};

const IndividualInterpretations = ({individual, variantsUrl, genesUrl}) => {
    const interpretations = useIndividualInterpretations(individual);
    const resourcesTuple = useIndividualResources(individual);
    return (
        <div>
            {interpretations.length ?
                (<Descriptions layout="horizontal" bordered={true} column={1} size="small" title="Interpretations">
                    {interpretations.map(interp => <Descriptions.Item label={interp.id} key={interp.id}>
                        <Interpretation interpretation={interp}
                                        resourcesTuple={resourcesTuple}
                                        variantsUrl={variantsUrl}
                                        genesUrl={genesUrl}/>
                    </Descriptions.Item>)}
                </Descriptions>)
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
        </div>
    );
};

IndividualInterpretations.propTypes = {
    individual: individualPropTypesShape,
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
};

export default IndividualInterpretations;
