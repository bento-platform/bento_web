import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { filesize } from "filesize";
import { throttle } from "lodash";

import { Layout, Input, Table, Descriptions, message } from "antd";

import { LAYOUT_CONTENT_STYLE } from "../../../styles/layoutContent";
import { useAuthorizationHeader } from "../../../lib/auth/utils";

import DownloadButton from "../../DownloadButton";

const SEARCH_CONTAINER_STYLE = {
    maxWidth: 800,
    marginBottom: "1rem",
};

const TABLE_NESTED_DESCRIPTIONS_STYLE = {
    backgroundColor: "white",
    borderRadius: 3,
};

const DRS_COLUMNS = [
    {
        title: "URI",
        dataIndex: "self_uri",
        key: "self_uri",
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Size",
        dataIndex: "size",
        key: "size",
        render: (size) => filesize(size),
    },
    {
        title: "Actions",
        dataIndex: "",
        key: "actions",
        render: (record) => {
            const url = record.access_methods[0]?.access_url?.url;
            return <DownloadButton disabled={!url} uri={url} />;
        },
    },
];

const ManagerDRSContent = () => {
    const drsUrl = useSelector((state) => state.services.drsService?.url);

    const authHeader = useAuthorizationHeader();

    const [searchResults, setSearchResults] = useState([]);
    const [doneSearch, setDoneSearch] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSearch = useCallback(
        throttle(
            (v) => {
                if (!drsUrl) return;

                // Extract value from either the native HTML event or the AntDesign event
                const sv = (v.target?.value ?? v ?? "").trim();
                if (!sv) {
                    setDoneSearch(false); // Behave as if we have never searched before
                    setSearchResults([]);
                    return;
                }

                setLoading(true);

                fetch(`${drsUrl}/search?` + new URLSearchParams({ q: sv }), { method: "GET", headers: authHeader })
                    .then((r) => Promise.all([Promise.resolve(r.ok), r.json()]))
                    .then(([ok, data]) => {
                        if (ok) {
                            console.debug("received DRS objects:", data);
                            setSearchResults(data);
                        } else {
                            message.error(`Encountered error while fetching DRS objects: ${data.message}`);
                            console.error(data);
                        }
                        setLoading(false);
                        setDoneSearch(true);
                    })
                    .catch((e) => {
                        message.error(`Encountered error while fetching DRS objects: ${e}`);
                        console.error(e);
                    });
            },
            250,
            { leading: true, trailing: true },
        ),
        [drsUrl, authHeader],
    );

    const tableLocale = useMemo(
        () => ({
            emptyText: doneSearch ? "No matching objects" : "Search to see matching objects",
        }),
        [doneSearch],
    );

    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <div style={SEARCH_CONTAINER_STYLE}>
                    <Input.Search
                        placeholder="Search DRS objects by name."
                        loading={loading || !drsUrl}
                        disabled={!drsUrl}
                        onChange={onSearch}
                        onSearch={onSearch}
                        size="large"
                    />
                </div>
                <Table
                    rowKey="id"
                    columns={DRS_COLUMNS}
                    dataSource={searchResults}
                    loading={loading}
                    bordered={true}
                    expandedRowRender={({ id, description, checksums, access_methods: accessMethods, size }) => (
                        <div style={TABLE_NESTED_DESCRIPTIONS_STYLE} className="table-nested-ant-descriptions">
                            <Descriptions bordered={true}>
                                <Descriptions.Item label="ID" span={2}>
                                    <span style={{ fontFamily: "monospace" }}>{id}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Size" span={1}>
                                    {filesize(size)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Checksums" span={3}>
                                    {checksums.map(({ type, checksum }) => (
                                        <div
                                            key={type}
                                            style={{ display: "flex", gap: "0.8em", alignItems: "baseline" }}
                                        >
                                            <span style={{ fontWeight: "bold" }}>{type.toLocaleUpperCase()}:</span>
                                            <span style={{ fontFamily: "monospace" }}>{checksum}</span>
                                        </div>
                                    ))}
                                </Descriptions.Item>
                                <Descriptions.Item label="Access Methods" span={3}>
                                    {accessMethods.map(({ type, access_url: url }, i) => (
                                        <div key={i} style={{ display: "flex", gap: "0.8em", alignItems: "baseline" }}>
                                            <span style={{ fontWeight: "bold" }}>{type.toLocaleUpperCase()}:</span>
                                            <span style={{ fontFamily: "monospace" }}>
                                                {type === "http" ? (
                                                    <a href={url?.url} target="_blank" rel="noreferrer">
                                                        {url?.url}
                                                    </a>
                                                ) : (
                                                    url?.url
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </Descriptions.Item>
                                {description && (
                                    <Descriptions.Item label="Description" span={3}>
                                        {description}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>
                    )}
                    locale={tableLocale}
                />
            </Layout.Content>
        </Layout>
    );
};

export default ManagerDRSContent;
