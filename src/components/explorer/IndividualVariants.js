import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Descriptions, Empty } from "antd";

import { individualPropTypesShape } from "../../propTypes";
import { setIgvPosition } from "../../modules/explorer/actions";
import { useDeduplicatedIndividualBiosamples, useIndividualInterpretations, useIndividualVariantInterpretations } from "./utils";
import "./explorer.css";
import g from "file-saver";

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

const GenomicInterpretation = ({genomicInterpretation, tracksUrl}) => {
    const isBiosampleRelated = genomicInterpretation?.extra_properties?.related_type ?? "";
    console.log(isBiosampleRelated);
    return (
        <div style={sampleStyle}>
            <Descriptions>
                <Descriptions.Item label={""}>
                    
                </Descriptions.Item>
                <Descriptions.Item></Descriptions.Item>
                <Descriptions.Item></Descriptions.Item>
            </Descriptions>
        </div>
    );
};


GenomicInterpretation.propTypes = {
    genomicInterpretation: PropTypes.object,
    tracksUrl: PropTypes.string,
};

const IndividualVariants = ({individual, tracksUrl}) => {
    const interpretations = useIndividualVariantInterpretations(individual);

    const genomicInterpretations = interpretations.map(i => i.diagnosis)
            .flatMap(d => d.genomic_interpretations)
            .filter(gi => gi.hasOwnProperty("variant_interpretation"))
    console.log(genomicInterpretations);

    return (
      <div className="variantDescriptions">
            {genomicInterpretations.length ?
                (<Descriptions layout="horizontal" bordered={true} column={1} size="small">
                    {genomicInterpretations.map(gi => 
                        <GenomicInterpretation genomicInterpretation={gi} tracksUrl={tracksUrl} key={gi.id}/>
                    )}
                </Descriptions>) :
                (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>)
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
