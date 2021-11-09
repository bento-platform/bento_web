import React from "react";
import {Link} from "react-router-dom";
import {Button, Descriptions} from "antd";

import {individualPropTypesShape} from "../../propTypes";
import "./explorer.css";

// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const sampleStyle = {display: "flex", flexDirection: "column", flexWrap: "nowrap"}
const variantStyle = {margin: "5px"}

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

    const VariantDetails =({v}) => {
      return  <div style={variantStyle}>
      <span style={{display: "inline", marginRight: "15px"} }>{`id: ${v.id} hgvs: ${v.hgvs}`}</span>
      {v.gene_context && (
        <>gene context: <Link
          to={{
            pathname: tracksUrl,
            state: { locus: v.gene_context },
          }}
        >
          <Button>{v.gene_context}</Button>
        </Link></>
      )}
    </div>
    }     

    const SampleVariants = ({id}) => {
      return <div style={sampleStyle}>{variantsMapped[id].map((v) => <VariantDetails v={v} />)}</div>
    } 

    return <div class="variantDescriptions"> <Descriptions
            layout="horizontal"
            bordered={true}
            column={1}
            size="small"
          >
              {ids.map( i => <Descriptions.Item label={i.title}>
                  <SampleVariants id={i.key} />
              </Descriptions.Item>)}
          </Descriptions></div >
};

IndividualVariants.propTypes = {
    individual: individualPropTypesShape
    //PropTypes.array,
};

export default IndividualVariants;
