import React from "react";
import {Link} from "react-router-dom";
import {useDispatch} from "react-redux";
import PropTypes from "prop-types";

import {Button, Descriptions, Empty} from "antd";

import {individualPropTypesShape} from "../../propTypes";
import {setIgvPosition} from "../../modules/explorer/actions";
import "./explorer.css";

// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const sampleStyle = {display: "flex", flexDirection: "column", flexWrap: "nowrap"};
const variantStyle = {margin: "5px"};

const IndividualVariants = ({individual, tracksUrl}) => {
    const dispatch = useDispatch();

    const biosamples = Object.values(
        Object.fromEntries(
            (individual || {}).phenopackets
                .flatMap(p => p.biosamples)
                .map(b => [b.id, b])
        )
    );

    const variantsMapped = Object.fromEntries(biosamples.map((biosample) => [
        biosample.id,
        (biosample.variants ?? []).map((v) => ({
            id: v.hgvsAllele?.id,
            hgvs: v.hgvsAllele?.hgvs,
            gene_context: v.extra_properties?.gene_context ?? "",
        })),
    ]));

    const VariantDetails = ({variant}) => (
        <div style={variantStyle}>
            <span style={{display: "inline", marginRight: "15px"} }>
                {`id: ${variant.id} hgvs: ${variant.hgvs}`}
            </span>
            {variant.gene_context && (
                <>
                    gene context:
                    <Link onClick={() => dispatch(setIgvPosition(variant.gene_context))}
                          to={{ pathname: tracksUrl }}>
                        <Button>{variant.gene_context}</Button>
                    </Link>
                </>
            )}
        </div>
    );

    const SampleVariants = ({biosampleID}) =>
        variantsMapped[biosampleID].length ? (
          <div style={sampleStyle}>
            {variantsMapped[biosampleID].map((v) => (
              <VariantDetails key={v.id} variant={v} />
            ))}
          </div>
        ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

    return (
      <div className="variantDescriptions">
          {biosamples.length ? <Descriptions layout="horizontal" bordered={true} column={1} size="small">
              {biosamples.map(({id}) => (
                  <Descriptions.Item key={id} label={`Biosample ${id}`}>
                      <SampleVariants biosampleID={id} />
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
