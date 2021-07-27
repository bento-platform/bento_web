import React from "react";

import {Table} from "antd";


import {individualPropTypesShape} from "../../propTypes";


// TODO: Only show diseases from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const METADATA_COLUMNS = [
    {
        title: "Resource ID",
        key: "r_id",
        render: (_, individual) => individual.id,
        sorter: (a, b) => a.id.toString().localeCompare(b.id),
        defaultSortOrder: "ascend",
    },{
        title: "Name",
        key: "name",
        render: (_, individual) => individual.name,
        sorter: (a, b) => a.name.toString().localeCompare(b.name),
        defaultSortOrder: "ascend",
    },{
        title: "Namespace Prefix",
        key: "namespace_prefix",
        render: (_, individual) => individual.namespace_prefix,
        sorter: (a, b) => a.namespace_prefix.toString().localeCompare(b.namespace_prefix),
        defaultSortOrder: "ascend",
    },{
        title: "Url",
        key: "url",
        render: (_, individual) => <a target="_blank"
                                      rel="noopener noreferrer"
                                      href={individual.url}>{individual.url}</a>,
        defaultSortOrder: "ascend",
    },{
        title: "Version",
        key: "version",
        render: (_, individual) => individual.version,
        sorter: (a, b) => a.version.toString().localeCompare(b.version),
        defaultSortOrder: "ascend",
    },{
        title: "IRI Prefix",
        key: "iri_prefix",
        render: (_, individual) => <a target="_blank"
                                      rel="noopener noreferrer"
                                      href={individual.iri_prefix}>{individual.iri_prefix}</a>,
        defaultSortOrder: "ascend",
    }
];

const IndividualMetadata = ({individual}) =>
    <Table bordered
           size="middle"
           pagination={{pageSize: 25}}
           columns={METADATA_COLUMNS}
           rowKey="id"
           dataSource={(individual || {}).phenopackets.flatMap(p => (p.meta_data || {}).resources || [])} />;



IndividualMetadata.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualMetadata;
