import React from "react";
import { useSelector } from "react-redux";

import { Link } from "react-router-dom";

import { Table, Typography, Tag, Icon} from "antd";

import { ROLE_OWNER } from "../constants";
import { withBasePath } from "../utils/url";

const SERVICE_KIND_STYLING = { fontFamily: "monospace" };

// biggest reasonable size limit before rolling over
// currently 11 services including gohan
const MAX_TABLE_PAGE_SIZE = 12;

const serviceTags = [
    {
        color: "blue",
        logo: null, value: ({serviceInfo}) => serviceInfo.environment.toUpperCase(),
    },
    // {color: null, logo: <Icon type="tag"/>, value: ({repository}) => `${repository.split("@")[1]}`},
    {
        color: null,
        logo: <Icon type="github"/>,
        value: ({serviceInfo}) => serviceInfo.bento.gitTag ?? serviceInfo.git_tag ?? "?",
    },
    {
        color: null,
        logo: <Icon type="branches"/>,
        value: ({serviceInfo}) => {
            const {bento} = serviceInfo;
            return `${(bento.gitBranch ?? serviceInfo.git_branch ?? "?")}:${(bento.gitCommit ?? "?").substring(0, 7)}`;
        },
    },
];

const renderGitInfo = (tag, record, key) => <Tag key={key} color={tag.color}>{tag.logo} {tag.value(record)}</Tag>;


/* eslint-disable react/prop-types */
const serviceColumns = (isOwner) => [
    {
        title: "Kind",
        dataIndex: "service_kind",
        render: (serviceKind) =>
            serviceKind ? (
                isOwner ? (
                    <Link style={SERVICE_KIND_STYLING} to={withBasePath(`admin/services/${serviceKind}`)}>
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
        render: (version, record) =>
            record.serviceInfo ? <>
                <Typography.Text style={{marginRight: "1em"}}>{version || "-"}</Typography.Text>
                {record.serviceInfo.environment === "dev" &&
                    serviceTags.map((tag, i) => renderGitInfo(tag, record, i))}
            </> : null,
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
        }))
    );

    const columns = serviceColumns(
        useSelector((state) => state.auth.hasAttempted && state.auth.user?.chord_user_role === ROLE_OWNER)
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
