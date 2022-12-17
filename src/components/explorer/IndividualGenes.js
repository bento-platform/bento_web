import React from "react";
import {Link} from "react-router-dom";
import { useDispatch } from "react-redux";
import {Button, Table} from "antd";
import { setIgvPosition } from "../../modules/explorer/actions";
import {individualPropTypesShape} from "../../propTypes";
import PropTypes from "prop-types";

// TODO: Only show genes from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const IndividualGenes = ({individual, tracksUrl}) => {
    const genes = (individual || {}).phenopackets.flatMap(p => p.genes);
    const genesFlat = genes.flatMap(g => ({symbol: g.symbol}));
    const dispatch = useDispatch();

    console.log({genesFlat: genesFlat});

    const igvLink = (symbol) => (
      <Link onClick={() => dispatch(setIgvPosition(symbol))}
            to={{
                pathname: tracksUrl,
            }}
      >
        <Button>{symbol}</Button>
      </Link>
    );

    const ids = [{
        //(biosamples || []).map(_b =>
        title: "Symbol",
            // key: "id",
        render: (_, gene) => igvLink(gene.symbol),
            //sorter: (a, b) => a.id.localeCompare(b.id),
            //defaultSortOrder: "ascend"
    },
    ];
    //);

    return <Table bordered
                  size="middle"
                  pagination={{pageSize: 25}}
                  columns={ids}
                  rowKey={gene => gene.symbol}
                  dataSource={genesFlat}
        />;
};
IndividualGenes.propTypes = {
    individual: individualPropTypesShape,
    tracksUrl: PropTypes.string
};

export default IndividualGenes;
