import React from "react";

import {Table} from "antd";

import {individualPropTypesShape} from "../../propTypes";
import {useResources} from "./utils";


// TODO: Only show diseases from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const METADATA_COLUMNS = [
    {
        title: "Resource ID",
        dataIndex: "id",
        sorter: (a, b) => a.id.toString().localeCompare(b.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Name",
        dataIndex: "name",
        sorter: (a, b) => a.name.toString().localeCompare(b.name),
        defaultSortOrder: "ascend",
    },
    {
        title: "Namespace Prefix",
        dataIndex: "namespace_prefix",
        sorter: (a, b) => a.namespace_prefix.toString().localeCompare(b.namespace_prefix),
        defaultSortOrder: "ascend",
    },
    {
        title: "Url",
        dataIndex: "url",
        render: (url) => <a target="_blank" rel="noopener noreferrer" href={url}>{url}</a>,
        defaultSortOrder: "ascend",
    },
    {
        title: "Version",
        dataIndex: "version",
        sorter: (a, b) => a.version.toString().localeCompare(b.version),
        defaultSortOrder: "ascend",
    },
    {
        title: "IRI Prefix",
        dataIndex: "iri_prefix",
        render: (iriPrefix) => <span style={{ fontFamily: "monospace" }}>{iriPrefix}</span>,
        defaultSortOrder: "ascend",
    },
];

const IndividualMetadata = ({individual}) => {
    const resources = useResources(individual);

    return (
        <Table
            bordered
            size="middle"
            pagination={{pageSize: 25}}
            columns={METADATA_COLUMNS}
            rowKey="id"
            dataSource={resources}
        />
    );
};

IndividualMetadata.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualMetadata;
