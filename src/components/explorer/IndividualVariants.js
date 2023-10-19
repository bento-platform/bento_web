import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Descriptions, Empty } from "antd";

import { individualPropTypesShape } from "../../propTypes";
import { setIgvPosition } from "../../modules/explorer/actions";
import { useIndividualResources, useIndividualVariantInterpretations } from "./utils";
import "./explorer.css";
import JsonView from "./JsonView";
import OntologyTerm from "./OntologyTerm";

// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const sampleStyle = {display: "flex", flexDirection: "column", flexWrap: "nowrap"};
const variantStyle = {margin: "5px"};

const mappedVariantPropType = PropTypes.shape({
    id: PropTypes.string,
    hgvs: PropTypes.string,
    geneContext: PropTypes.string,
});

const VariantDetails = ({variant, tracksUrl}) => {
    const dispatch = useDispatch();

    return (
        <div style={variantStyle}>
            <span style={{display: "inline", marginRight: "15px"} }>
                {`id: ${variant.id} hgvs: ${variant.hgvs}`}
            </span>
            {variant.geneContext && (
                <>
                    gene context:
                    <Link onClick={() => dispatch(setIgvPosition(variant.geneContext))}
                          to={{ pathname: tracksUrl }}>
                        <Button>{variant.geneContext}</Button>
                    </Link>
                </>
            )}
        </div>
    );
};
VariantDetails.propTypes = {
    variant: mappedVariantPropType,
    tracksUrl: PropTypes.string,
};

const SampleVariants = ({variantsMapped, biosampleID, tracksUrl}) =>
    variantsMapped[biosampleID].length ? (
        <div style={sampleStyle}>
            {variantsMapped[biosampleID].map((v) => (
                <VariantDetails key={v.id} variant={v} tracksUrl={tracksUrl} />
            ))}
        </div>
    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
SampleVariants.propTypes = {
    variantsMapped: PropTypes.objectOf(PropTypes.arrayOf(mappedVariantPropType)),
    biosampleID: PropTypes.string,
    tracksUrl: PropTypes.string,
};

const ConditionalDescriptionItem = ({data, label}) => {
    console.log(label, data);
    return <>
        {data && <Descriptions.Item label={label}>{data}</Descriptions.Item>}
    </>;
}
ConditionalDescriptionItem.propTypes = {
    data: PropTypes.any,
    label: PropTypes.any,
}

const VariantInterpretationDescriptor = ({genomicInterpretation, resourcesTuple}) => {
    const variantInterpretation = genomicInterpretation?.variant_interpretation ?? {};
    const variationDescriptor = variantInterpretation?.variation_descriptor ?? {};
    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label={"ID"}>{variationDescriptor.id}</Descriptions.Item>
            <ConditionalDescriptionItem data={variationDescriptor?.variation} label={"Variation"}/>
            <ConditionalDescriptionItem data={variationDescriptor?.label} label={"Label"}/>
            <ConditionalDescriptionItem data={variationDescriptor?.description} label={"Description"}/>
            <ConditionalDescriptionItem data={variationDescriptor?.gene_context} label={"Gene Context"}/>
            {variationDescriptor.expressions && <Descriptions.Item label={"Expressions"}>
                {/* TODO */}
            </Descriptions.Item>}
            {variationDescriptor.vcf_record && <Descriptions.Item label={"VCF Record"}>
                {/* TODO */}
            </Descriptions.Item>}
            {<Descriptions.Item label={"XRefs"}>{variationDescriptor.xrefs}</Descriptions.Item>}
            <Descriptions.Item label={"Alternate Labels"}>{variationDescriptor.alternate_labels}</Descriptions.Item>
            <Descriptions.Item label={"Extensions"}>
                {/* TODO */}
            </Descriptions.Item>
            <Descriptions.Item label={"Molecule Context"}>{variationDescriptor.molecule_context}</Descriptions.Item>
            {variationDescriptor.structural_type && <Descriptions.Item label={"Structural Type"}>
                <OntologyTerm resourcesTuple={resourcesTuple} term={variationDescriptor.structural_type}/>
            </Descriptions.Item>}
            <Descriptions.Item label={"VRS ref allele sequence"}>{variationDescriptor.vrs_ref_allele_seq}</Descriptions.Item>
            {variationDescriptor.allelic_state && <Descriptions.Item label={"Allelic State"}>
                <OntologyTerm resourcesTuple={resourcesTuple} term={variationDescriptor.allelic_state}/>
            </Descriptions.Item>}
        </Descriptions>
    );
};
VariantInterpretationDescriptor.propTypes = {
    genomicInterpretation: PropTypes.object,
    resourcesTuple: PropTypes.array,
};

const IndividualVariants = ({individual, tracksUrl}) => {
    const variantGenomicInterpretations = useIndividualVariantInterpretations(individual);
    const resourcesTuple = useIndividualResources(individual);

    return (
      <div className="variantDescriptions">
            {
                variantGenomicInterpretations.length ? <Descriptions layout="horizontal" bordered={true} column={1} size="small">
                    {variantGenomicInterpretations.map(gi => {
                        return (
                            <Descriptions.Item key={gi.id} label={gi.id}>
                                <VariantInterpretationDescriptor genomicInterpretation={gi} resourcesTuple={resourcesTuple}/>
                            </Descriptions.Item>
                        )
                    })}
                </Descriptions>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
            }
      </div>
    );
};

IndividualVariants.propTypes = {
    id: PropTypes.string,
    individual: individualPropTypesShape,
    variant: PropTypes.object,
    tracksUrl: PropTypes.string,
};

export default IndividualVariants;
