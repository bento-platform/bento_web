import React from "react";

import {Table} from "antd";

import {individualPropTypesShape} from "../../propTypes";

// TODO: Only show genes from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const IndividualGenes = ({individual}) => {
    const genes = (individual || {}).phenopackets.flatMap(p => p.genes);
    const genesFlat = genes.flatMap(g => g.symbol);
    const ids = [{
        //(biosamples || []).map(_b =>
        title: "Symbol",
            // key: "id",
        render: (_, gene) => <div><pre>{gene}</pre></div>,
            //sorter: (a, b) => a.id.localeCompare(b.id),
            //defaultSortOrder: "ascend"
    }];
    //);

    return <Table bordered
                  size="middle"
                  pagination={{pageSize: 25}}
                  columns={ids}
                  rowKey="id"
                  dataSource={genesFlat}
        />;
};
IndividualGenes.propTypes = {
    individual: individualPropTypesShape
    //PropTypes.array,
};

export default IndividualGenes;
