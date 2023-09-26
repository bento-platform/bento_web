import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Descriptions, Empty } from "antd";

import { individualPropTypesShape } from "../../propTypes";
import { setIgvPosition } from "../../modules/explorer/actions";
import { useDeduplicatedIndividualBiosamples } from "./utils";
import "./explorer.css";

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

const IndividualVariants = ({individual, tracksUrl}) => {
    const biosamples = useDeduplicatedIndividualBiosamples(individual);

    const variantsMapped = useMemo(
        () => Object.fromEntries(biosamples.map((biosample) => [
            biosample.id,
            (biosample.variants ?? []).map((v) => ({
                id: v.hgvsAllele?.id,
                hgvs: v.hgvsAllele?.hgvs,
                geneContext: v.extra_properties?.gene_context ?? "",
            })),
        ])),
        [biosamples],
    );

    return (
      <div className="variantDescriptions">
          {biosamples.length ? <Descriptions layout="horizontal" bordered={true} column={1} size="small">
              {biosamples.map(({id}) => (
                  <Descriptions.Item key={id} label={`Biosample ${id}`}>
                      <SampleVariants variantsMapped={variantsMapped} biosampleID={id} tracksUrl={tracksUrl} />
                  </Descriptions.Item>
              ))}
          </Descriptions> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
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
