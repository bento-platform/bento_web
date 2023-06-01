import React, {useCallback, useEffect, useMemo, useState} from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

import {Table, Typography, Tag, Icon, Button, Modal, Form, Input, Divider, Skeleton} from "antd";

import {getIsAuthenticated, makeAuthorizationHeader} from "../lib/auth/utils";
import { withBasePath } from "../utils/url";
import JsonDisplay from "./JsonDisplay";

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
const serviceColumns = (isAuthenticated, setRequestModalService) => [
    {
        title: "Kind",
        dataIndex: "service_kind",
        render: (serviceKind) =>
            serviceKind ? (
                isAuthenticated ? (
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
        render: (version, record) => {
            const {serviceInfo} = record;
            return serviceInfo ? <>
                <Typography.Text style={{marginRight: "1em"}}>{version || "-"}</Typography.Text>
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

const ServiceRequestModal = ({service, onCancel}) => {
    const bentoServicesByKind = useSelector(state => state.chordServices.itemsByKind);
    const serviceUrl = useMemo(() => bentoServicesByKind[service]?.url, [bentoServicesByKind, service]);

    const [requestPath, setRequestPath] = useState("service-info");
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestData, setRequestData] = useState(null);
    const [requestIsJSON, setRequestIsJSON] = useState(false);

    const [hasAttempted, setHasAttempted] = useState(false);

    const accessToken = useSelector((state) => state.auth.accessToken);

    const performRequestModalGet = useCallback(() => {
        if (!serviceUrl) {
            setRequestData(null);
            return;
        }
        (async () => {
            setRequestLoading(true);

            try {
                const res = await fetch(`${serviceUrl}/${requestPath}`, {
                    headers: makeAuthorizationHeader(accessToken),
                });

                if ((res.headers.get("content-type") ?? "").includes("application/json")) {
                    const data = await res.json();
                    setRequestIsJSON(true);
                    setRequestData(data);
                } else {
                    const data = await res.text();
                    setRequestIsJSON(false);
                    setRequestData(data);
                }
            } finally {
                setRequestLoading(false);
            }
        })();
    }, [serviceUrl, requestPath, accessToken]);

    useEffect(() => {
        setRequestData(null);
        setRequestIsJSON(false);
        setRequestPath("service-info");
        setHasAttempted(false);
    }, [service]);

    useEffect(() => {
        if (!hasAttempted) {
            performRequestModalGet();
            setHasAttempted(true);
        }
    }, [hasAttempted, performRequestModalGet]);

    return <Modal visible={service !== null}
                  title={`${service}: make a request`}
                  footer={null}
                  width={960}
                  onCancel={onCancel}>
        <Form layout="inline" style={{display: "flex"}}>
            <Form.Item style={{flex: 1}} wrapperCol={{span: 24}}>
                <Input
                    addonBefore={(serviceUrl ?? "ERROR") + "/"}
                    value={requestPath}
                    disabled={!hasAttempted || requestLoading}
                    onChange={e => setRequestPath(e.target.value)}
                />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlFor="submit" onClick={e => {
                    performRequestModalGet();
                    e.preventDefault();
                }}>GET</Button>
            </Form.Item>
        </Form>
        <Divider />
        {requestLoading ? <Skeleton loading={true} /> : (
            requestIsJSON
                ? <JsonDisplay jsonSrc={requestData} />
                : (
                    <div style={{maxWidth: "100%", overflowX: "auto"}}>
                        <pre>
                            {((typeof requestData) === "string" || requestData === null)
                                ? requestData
                                : JSON.stringify(requestData)}
                        </pre>
                    </div>
                )
        )}
    </Modal>;
};
ServiceRequestModal.propTypes = {
    service: PropTypes.string,
    onCancel: PropTypes.func,
};

const ServiceList = () => {
    const [requestModalService, setRequestModalService] = useState(null);

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

    const isAuthenticated = useSelector(
        (state) => state.auth.hasAttempted && getIsAuthenticated(state.auth.idTokenContents));

    const columns = useMemo(
        () => serviceColumns(isAuthenticated, setRequestModalService),
        [isAuthenticated]);

    /** @type boolean */
    const isLoading = useSelector((state) => state.chordServices.isFetching || state.services.isFetching);

    return <>
        <ServiceRequestModal
            visible={requestModalService !== null}
            service={requestModalService}
            onCancel={() => setRequestModalService(null)} />
        <Table
            bordered
            style={{marginBottom: 24}}
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
