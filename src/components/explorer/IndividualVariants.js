import React from "react";

import {Table} from "antd";

import {individualPropTypesShape} from "../../propTypes";
import "./explorer.css";

// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const IndividualVariants = ({individual}) => {
    const biosamples = (individual || {}).phenopackets.flatMap(p => p.biosamples);

    const variantsMapped = {};
    biosamples.forEach(bs => {
        variantsMapped[bs.id] = ((bs || {}).variants || []).map(v => (v || {}).hgvsAllele);
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

    return <Table bordered
                  size="middle"
                  pagination={{pageSize: 25}}
                  columns={ids}
                  rowKey="id"
                  dataSource={[variantsMapped]}
        />;
};


IndividualVariants.propTypes = {
    individual: individualPropTypesShape
    //PropTypes.array,
};

export default IndividualVariants;
