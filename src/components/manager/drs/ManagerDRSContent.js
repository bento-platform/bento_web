import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { filesize } from "filesize";
import { throttle } from "lodash";
import { useAuthorizationHeader } from "bento-auth-js";

import { Layout, Input, Table, Descriptions, message } from "antd";

import { EM_DASH } from "@/constants";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import BooleanYesNo from "@/components/common/BooleanYesNo";
import DownloadButton from "@/components/common/DownloadButton";
import MonospaceText from "@/components/common/MonospaceText";
import DatasetTitleDisplay from "../DatasetTitleDisplay";
import ProjectTitleDisplay from "../ProjectTitleDisplay";
import { useSearchParams } from "react-router-dom";

const TABLE_NESTED_DESCRIPTIONS_STYLE = {
    backgroundColor: "white",
    borderRadius: 3,
    maxWidth: 1400,
};

const DRSObjectDetail = ({ drsObject }) => {
    const { id, description, checksums, access_methods: accessMethods, size, bento } = drsObject;
    return (
        <div style={TABLE_NESTED_DESCRIPTIONS_STYLE} className="table-nested-ant-descriptions">
            <Descriptions bordered={true}>
                <Descriptions.Item label="ID" span={2}>
                    <MonospaceText>{id}</MonospaceText>
                </Descriptions.Item>
                <Descriptions.Item label="Size" span={1}>
                    {filesize(size)}
                </Descriptions.Item>
                {description && (
                    <Descriptions.Item label="Description" span={3}>
                        {description}
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Checksums" span={3}>
                    {checksums.map(({ type, checksum }) => (
                        <div
                            key={type}
                            style={{ display: "flex", gap: "0.8em", alignItems: "baseline" }}
                        >
                            <span style={{ fontWeight: "bold" }}>{type.toLocaleUpperCase()}:</span>
                            <MonospaceText>{checksum}</MonospaceText>
                        </div>
                    ))}
                </Descriptions.Item>
                <Descriptions.Item label="Access Methods" span={2}>
                    {accessMethods.map(({ type, access_url: url }, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.8em", alignItems: "baseline" }}>
                            <span style={{ fontWeight: "bold" }}>{type.toLocaleUpperCase()}:</span>
                            <MonospaceText>
                                {["http", "https"].includes(type) ? (  // "http" for back-compat
                                    <a href={url?.url} target="_blank" rel="noreferrer">
                                        {url?.url}
                                    </a>
                                ) : (
                                    url?.url
                                )}
                            </MonospaceText>
                        </div>
                    ))}
                </Descriptions.Item>
                <Descriptions.Item label="Public" span={1}>
                    <BooleanYesNo value={bento?.public} />
                </Descriptions.Item>
                <Descriptions.Item label="Project" span={1}>
                    <ProjectTitleDisplay projectID={bento?.project_id} link={true} />
                </Descriptions.Item>
                <Descriptions.Item label="Dataset" span={1}>
                    <DatasetTitleDisplay datasetID={bento?.dataset_id} link={true} />
                </Descriptions.Item>
                <Descriptions.Item label="Data Type" span={1}>
                    {bento?.data_type ?? EM_DASH}
                </Descriptions.Item>
            </Descriptions>
        </div>
    );
};
DRSObjectDetail.propTypes = {
    drsObject: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
        size: PropTypes.number,
        checksums: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string.isRequired,
            checksum: PropTypes.string.isRequired,
        })),
        access_methods: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string.isRequired,
            access_url: PropTypes.shape({ url: PropTypes.string }),
        })),
        bento: PropTypes.shape({
            project_id: PropTypes.string,
            dataset_id: PropTypes.string,
            data_type: PropTypes.string,
            public: PropTypes.bool,
        }),
    }),
};

const SEARCH_CONTAINER_STYLE = {
    maxWidth: 800,
    marginBottom: "1rem",
};

const DRS_COLUMNS = [
    {
        title: "URI",
        dataIndex: "self_uri",
        render: (selfUri) => <MonospaceText>{selfUri}</MonospaceText>,
    },
    {
        title: "Name",
        dataIndex: "name",
    },
    {
        title: "Size",
        dataIndex: "size",
        render: (size) => filesize(size),
    },
    {
        title: "Actions",
        dataIndex: "",
        key: "actions",
        render: (record) => {
            const url = record.access_methods[0]?.access_url?.url;
            return <DownloadButton disabled={!url} uri={url} fileName={record.name} size="small" />;
        },
    },
];

// noinspection JSUnusedGlobalSymbols
const DRS_TABLE_EXPANDABLE = {
    expandedRowRender: (drsObject) => <DRSObjectDetail drsObject={drsObject} />,
};

// noinspection JSCheckFunctionSignatures
const buildDRSSearchURL = (drsURL, q) =>
    `${drsURL}/search?` + new URLSearchParams({ q, with_bento_properties: true });

const ManagerDRSContent = () => {
    const drsURL = useSelector((state) => state.services.drsService?.url);

    const authHeader = useAuthorizationHeader();

    const [searchParams, setSearchParams] = useSearchParams();
    const { q: initialSearchQuery } = searchParams;
    const [searchValue, setSearchValue] = useState(initialSearchQuery ?? "");

    const [searchResults, setSearchResults] = useState([]);
    const [doneSearch, setDoneSearch] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSearch = useCallback((e) => {
        const q = (e.target?.value ?? e ?? "").trim();
        setSearchValue(q);
        setSearchParams({ q });
    }, []);

    const performSearch = useMemo(() => throttle(
        () => {
            if (!drsURL) return;

            if (!searchValue) {
                setDoneSearch(false); // Behave as if we have never searched before
                setSearchResults([]);
                return;
            }

            setLoading(true);

            fetch(buildDRSSearchURL(drsURL, searchValue), { method: "GET", headers: authHeader })
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
    ), [drsURL, searchValue]);

    useEffect(() => {
        console.log(searchValue);
        performSearch();
    }, [searchValue]);

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
                        loading={loading || !drsURL}
                        disabled={!drsURL}
                        onChange={onSearch}
                        onSearch={onSearch}
                        value={searchValue}
                        size="large"
                    />
                </div>
                <Table
                    rowKey="id"
                    columns={DRS_COLUMNS}
                    dataSource={searchResults}
                    loading={loading}
                    bordered={true}
                    size="middle"
                    expandable={DRS_TABLE_EXPANDABLE}
                    locale={tableLocale}
                />
            </Layout.Content>
        </Layout>
    );
};

export default ManagerDRSContent;
