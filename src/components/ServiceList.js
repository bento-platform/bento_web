import React from "react";
import { useSelector } from "react-redux";

import { Link } from "react-router-dom";

import { Table, Typography, Tag, Icon} from "antd";

import { getIsAuthenticated } from "../lib/auth/utils";

const SERVICE_KIND_STYLING = { fontFamily: "monospace" };
const MAX_TABLE_PAGE_SIZE = 15;

// noinspection JSUnresolvedFunction
const getServiceTags = serviceInfo => [
    {
        color: (serviceInfo.environment ?? "") === "prod" ? "green" : "blue",
        logo: null,
        value: serviceInfo.environment ? serviceInfo.environment.toUpperCase() : undefined,
    },
    {
        color: serviceInfo.bento?.gitCommit ? "blue" : "green",
        logo: null,
        value: serviceInfo.environment ? (serviceInfo.bento?.gitCommit ? "LOCAL" : "PRE-BUILT") : undefined,
    },
    // {color: null, logo: <Icon type="tag"/>, value: ({repository}) => `${repository.split("@")[1]}`},
    {
        color: null,
        logo: <Icon type="github"/>,
        value: serviceInfo.bento?.gitTag ?? serviceInfo.git_tag,
    },
    {
        color: null,
        logo: <Icon type="branches"/>,
        value: (() => {
            const {bento} = serviceInfo;

            const branch = bento?.gitBranch ?? serviceInfo.git_branch;
            /** @type {string|undefined} */
            const commit = bento?.gitCommit;

            if (!branch || !commit) return undefined;

            return `${branch}:${commit.substring(0, 7)}`;
        })(),
    },
].filter(t => t.value);

const renderGitInfo = (tag, record, key) => <Tag key={key} color={tag.color}>{tag.logo} {tag.value}</Tag>;


/* eslint-disable react/prop-types */
const serviceColumns = (isAuthenticated) => [
    {
        title: "Kind",
        dataIndex: "service_kind",
        render: (serviceKind) =>
            serviceKind ? (
                isAuthenticated ? (
                    <Link style={SERVICE_KIND_STYLING} to={`/admin/services/${serviceKind}`}>
                        {serviceKind}
                    </Link>
                ) : (
                    <span style={SERVICE_KIND_STYLING}>{serviceKind}</span>
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
        render: (version, record) => {
            const {serviceInfo} = record;
            return serviceInfo ? <>
                <Typography.Text style={{marginRight: "1em"}}>{version || "-"}</Typography.Text>
                {getServiceTags(serviceInfo).map((tag, i) => renderGitInfo(tag, record, i))}
            </> : null;
        },
    },
    {
        title: "URL",
        dataIndex: "url",
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
        Object.entries(state.chordServices.itemsByKind).map(([kind, service]) => ({
            ...service,
            key: kind,
            serviceInfo: state.services.itemsByKind[kind] ?? null,
            status: {
                status: kind in state.services.itemsByKind,
                dataService: service.data_service,
            },
            loading: state.services.isFetching,
        })),
    );

    const columns = serviceColumns(
        useSelector((state) => state.auth.hasAttempted && getIsAuthenticated(state.auth.idTokenContents)),
    );

    /** @type boolean */
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
