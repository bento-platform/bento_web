import React from "react";
import {Link} from "react-router-dom";
import {Button, Descriptions, Empty} from "antd";
import PropTypes from "prop-types";
import {individualPropTypesShape} from "../../propTypes";
import "./explorer.css";

// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const sampleStyle = {display: "flex", flexDirection: "column", flexWrap: "nowrap"};
const variantStyle = {margin: "5px"};

const IndividualVariants = ({individual, tracksUrl}) => {
    const biosamples = (individual || {}).phenopackets.flatMap(p => p.biosamples);

    const variantsMapped = {};

    biosamples.forEach((bs) => {
        const allvariants = (bs || {}).variants;

        const variantsObject = (allvariants || []).map((v) => ({
            id: v.hgvsAllele?.id,
            hgvs: v.hgvsAllele?.hgvs,
            gene_context: v.extra_properties?.gene_context ?? "",
        }));
        variantsMapped[bs.id] = variantsObject;
    });

    const ids = (biosamples || []).map(b =>
        ({
            title: `Biosample ${b.id}`,
            key: b.id,
            render: (_, map) => <div style={{verticalAlign: "top"}}>
                <pre>{JSON.stringify(map[b.id], null, 2)}</pre></div>,
            //sorter: (a, b) => a.id.localeCompare(b.id),
            //defaultSortOrder: "ascend"
        })
    );

    const VariantDetails = ({variant}) => {
        return  <div style={variantStyle}>
      <span style={{display: "inline", marginRight: "15px"} }>{`id: ${variant.id} hgvs: ${variant.hgvs}`}</span>
      {variant.gene_context && (
          <>gene context: <Link
          to={{
              pathname: tracksUrl,
              state: { locus: variant.gene_context },
          }}
        >
          <Button>{variant.gene_context}</Button>
        </Link></>
      )}
    </div>;
    };

    const SampleVariants = ({id}) => {

        return variantsMapped[id].length ? (
          <div style={sampleStyle}>
            {variantsMapped[id].map((v) => (
              <VariantDetails key={v.id} variant={v} />
            ))}
          </div>
        ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    };

    return (
      <div className="variantDescriptions">
          {ids.length ? <Descriptions layout="horizontal" bordered={true} column={1} size="small">
              {ids.map((i) => (
                  <Descriptions.Item key={i.key} label={i.title}>
                      <SampleVariants id={i.key}/>
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
