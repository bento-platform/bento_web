import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Descriptions, List, Table, Typography } from "antd";

import { setIgvPosition } from "@/modules/explorer/actions";
import { individualPropTypesShape } from "@/propTypes";

// TODO: Only show genes from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const StringList = ({ values }) => {
    return (
        <List
            bordered
            dataSource={values}
            renderItem={item => (
                <List.Item>
                    <Typography.Text code>{item}</Typography.Text>
                </List.Item>
            )}
        />
    );
};
StringList.propTypes = {
    values: PropTypes.arrayOf(PropTypes.string),
};

export const GeneDescriptor = ({ geneDescriptor }) => {
    return (
        <Descriptions bordered={true} column={1} size="small">
            <Descriptions.Item label="Value ID">{geneDescriptor.value_id}</Descriptions.Item>
            <Descriptions.Item label="Symbol">{geneDescriptor.symbol}</Descriptions.Item>
            <Descriptions.Item label="Description">{geneDescriptor.description}</Descriptions.Item>
            <Descriptions.Item label="Alternate IDs">
                <StringList values={geneDescriptor?.alternate_ids ?? []}/>
            </Descriptions.Item>
            <Descriptions.Item label="Cross References">
                <StringList values={geneDescriptor?.xrefs ?? []}/>
            </Descriptions.Item>
            <Descriptions.Item label="Alternate Symbols">
                <StringList values={geneDescriptor?.alternate_symbols ?? []}/>
            </Descriptions.Item>
        </Descriptions>
    );
};
GeneDescriptor.propTypes = {
    geneDescriptor: PropTypes.object,
};

const GeneIGVLink = React.memo(({symbol, tracksUrl}) => {
    const dispatch = useDispatch();
    return (
        <Link onClick={() => dispatch(setIgvPosition(symbol))} to={{ pathname: tracksUrl }}>
            <Button>{symbol}</Button>
        </Link>
    );
});
GeneIGVLink.propTypes = {
    symbol: PropTypes.string,
    tracksUrl: PropTypes.string,
};

const IndividualGenes = ({individual, tracksUrl}) => {
    const genes = useMemo(
        () => Object.values(
            Object.fromEntries(
                (individual || {}).phenopackets
                    .flatMap(p => p.genes)
                    .map(g => [g.symbol, g]),
            ),
        ),
        [individual],
    );

    const columns = useMemo(
        () => [
            {
                title: "Symbol",
                dataIndex: "symbol",
                render: (symbol) => <GeneIGVLink symbol={symbol} tracksUrl={tracksUrl} />,
            },
        ],
        [tracksUrl],
    );

    return (
        <Table
            bordered
            size="middle"
            pagination={{pageSize: 25}}
            columns={columns}
            rowKey="symbol"
            dataSource={genes}
        />
    );
};
IndividualGenes.propTypes = {
    individual: individualPropTypesShape,
    tracksUrl: PropTypes.string,
};

export default IndividualGenes;
