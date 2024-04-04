import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useIsAuthenticated } from "bento-auth-js";

import { Link } from "react-router-dom";

import { Table, Typography, Tag, Button } from "antd";
import { BranchesOutlined, GithubOutlined } from "@ant-design/icons";

import ServiceRequestModal from "./services/ServiceRequestModal";

const SERVICE_KIND_STYLING = { fontFamily: "monospace" };

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
        logo: <GithubOutlined />,
        value: serviceInfo.bento?.gitTag ?? serviceInfo.git_tag,
    },
    {
        color: null,
        logo: <BranchesOutlined />,
        value: (() => {
            const { bento } = serviceInfo;

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
const serviceColumns = (isAuthenticated, setRequestModalService) => [
    {
        title: "Kind",
        dataIndex: "service_kind",
        render: (serviceKind) =>
            serviceKind ? (
                isAuthenticated ? (
                    <Link style={SERVICE_KIND_STYLING} to={`/services/${serviceKind}`}>
                        {serviceKind}
                    </Link>
                ) : (
                    <span style={SERVICE_KIND_STYLING}>{serviceKind}</span>
                )
            ) : null,
    },
    {
        title: "Name",
        dataIndex: ["serviceInfo", "name"],
    },
    {
        title: "Version",
        dataIndex: ["serviceInfo", "version"],
        render: (version, record) => {
            const { serviceInfo } = record;
            return serviceInfo ? <>
                <Typography.Text style={{ marginRight: "1em" }}>{version || "-"}</Typography.Text>
                {getServiceTags(serviceInfo).map((tag, i) => renderGitInfo(tag, record, i))}
            </> : null;
        },
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
    {
        title: "Actions",
        render: (service) => {
            const onClick = () =>
                setRequestModalService(service.serviceInfo?.bento?.serviceKind ?? service.key ?? null);
            return <Button size="small" onClick={onClick}>Make Request</Button>;
        },
    },
];
/* eslint-enable react/prop-types */

const ServiceList = () => {
    const [requestModalService, setRequestModalService] = useState(null);

    const servicesFetching = useSelector((state) => state.services.isFetching);
    const bentoServicesFetching = useSelector((state) => state.bentoServices.isFetching);

    const servicesByKind = useSelector((state) => state.services.itemsByKind);
    const bentoServicesByKind = useSelector((state) => state.bentoServices.itemsByKind);

    const dataSource = useMemo(() => Object.entries(bentoServicesByKind).map(([kind, service]) => {
        const serviceInfo = servicesByKind[kind] ?? null;
        return {
            ...service,
            key: kind,
            serviceInfo,
            status: {
                status: kind in servicesByKind,
                dataService: serviceInfo?.bento?.dataService,
            },
            loading: servicesFetching,
        };
    }), [servicesByKind, bentoServicesByKind]);

    const isAuthenticated = useIsAuthenticated();

    const columns = useMemo(
        () => serviceColumns(isAuthenticated, setRequestModalService),
        [isAuthenticated]);

    /** @type boolean */
    const isLoading = servicesFetching || bentoServicesFetching;

    return <>
        <ServiceRequestModal service={requestModalService} onCancel={() => setRequestModalService(null)} />
        <Table
            bordered
            style={{ marginBottom: 24 }}
            size="middle"
            columns={columns}
            dataSource={dataSource}
            rowKey="key"
            pagination={false}
            loading={isLoading}
        />
    </>;
};

export default ServiceList;
