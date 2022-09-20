import React from "react";
import { useSelector } from "react-redux";

import { Link } from "react-router-dom";

import { Table, Typography, Tag} from "antd";

import { ROLE_OWNER } from "../constants";
import { withBasePath } from "../utils/url";
import { BranchesOutlined, GithubOutlined, TagOutlined} from "@ant-design/icons";

const ARTIFACT_STYLING = { fontFamily: "monospace" };

// biggest reasonable size limit before rolling over
// currently 11 services including gohan
const MAX_TABLE_PAGE_SIZE = 12;

const data = [
    {color: "blue", logo: null, value: ({serviceInfo}) => serviceInfo.environment},
    {color: null, logo: <TagOutlined/>, value: ({repository}) => `chord_${repository.split("@")[1]}`},
    {color: null, logo: <GithubOutlined/>, value: ({serviceInfo}) => serviceInfo.git_tag},
    {color: null, logo: <BranchesOutlined/>, value: ({serviceInfo}) => serviceInfo.git_branch}
];

const renderGitInfo = (tag, record) => <Tag color={tag.color}>{tag.logo} {tag.value(record)}</Tag>;


/* eslint-disable react/prop-types */
const serviceColumns = (isOwner) => [
    {
        title: "Artifact",
        dataIndex: "type.artifact",
        render: (artifact) =>
            artifact ? (
                isOwner ? (
                    <Link style={ARTIFACT_STYLING} to={withBasePath(`admin/services/${artifact}`)}>
                        {artifact}
                    </Link>
                ) : (
                    <span style={ARTIFACT_STYLING}>{artifact}</span>
                )
            ) : null,
    },
    {
        title: "Name",
        dataIndex: "serviceInfo.name",
    },
    {
        title: "Version",
        dataIndex: "serviceInfo.version",
        render: (version, record) =>
            record.serviceInfo ? (
                <>
                <Typography.Text>{version || "-"}</Typography.Text>
                {"  "}
                {record.serviceInfo.environment === "dev" && data.map((tag) => renderGitInfo(tag, record))}</>) : (
                null),
    },
    {
        title: "URL",
        dataIndex: "serviceInfo.url",
        // url is undefined when service-registry does not receive replies from
        // the container.
        render: (url) => url ? <a href={`${url}/service-info`}>{`${url}/service-info`}</a> : "N/A",
    },
    {
        title: "Status",
        dataIndex: "status",
        render: ({ status, dataService }, service) =>
            service.loading ? (
                <Tag>LOADING</Tag>
            ) : (
                [
                    <Tag key="1" color={status ? "green" : "red"}>
                        {status ? "HEALTHY" : "ERROR"}
                    </Tag>,
                    dataService ? (
                        <Tag key="2" color="blue">
                            DATA SERVICE
                        </Tag>
                    ) : null,
                ]
            ),
    },
];
/* eslint-enable react/prop-types */

const ServiceList = () => {
    const dataSource = useSelector((state) =>
        state.chordServices.items.map((service) => ({
            ...service,
            key: `${service.type.organization}:${service.type.artifact}`,
            serviceInfo: state.services.itemsByArtifact[service.type.artifact] || null,
            status: {
                status: state.services.itemsByArtifact.hasOwnProperty(service.type.artifact),
                dataService: service.data_service,
            },
            loading: state.services.isFetching,
        }))
    );

    const columns = serviceColumns(
        useSelector((state) => state.auth.hasAttempted && (state.auth.user || {}).chord_user_role === ROLE_OWNER)
    );
    const isLoading = useSelector((state) => state.chordServices.isFetching || state.services.isFetching);

    return (
        <Table
            bordered
            size="middle"
            columns={columns}
            dataSource={dataSource}
            rowKey="key"
            pagination={{ defaultPageSize: MAX_TABLE_PAGE_SIZE }}
            loading={isLoading}
        />
    );
};

export default ServiceList;
