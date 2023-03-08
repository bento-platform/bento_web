import React, {useCallback, useState} from "react";
import {useSelector} from "react-redux";
import {filesize} from "filesize";

import {Layout, Input, Table, Button, Descriptions} from "antd";

import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";

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
        render: size => filesize(size),
    },
    {
        title: "Actions",
        dataIndex: "",
        key: "actions",
        render: record => {
            const url = record.access_methods[0]?.access_url?.url;
            return <Button disabled={!url} icon="download" onClick={() => {
                console.debug(`Opening ${url} for download`);
                window.open(url)
            }}>Download</Button>;
        },
    }
];

const ManagerDRSContent = () => {
    const drsUrl = useSelector(state => state.services.drsService?.url);

    const [searchResults, setSearchResults] = useState([]);
    const [doneSearch, setDoneSearch] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSearch = useCallback(v => {
        if (!drsUrl) return;

        const sv = (v.target?.value ?? v).trim();
        if (!sv) return;

        setLoading(true);

        fetch(`${drsUrl}/search?` + new URLSearchParams({q: sv}))
            .then(r => r.json())
            .then(data => {
                if (!(data.errors ?? []).length) {
                    console.debug("received DRS objects:", data);
                    setSearchResults(data);
                } else {
                    console.error(data);
                }
                setLoading(false);
                setDoneSearch(true);
            })
            .catch(e => console.error(e));  // TODO: error popup
    }, [drsUrl]);

    return <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <div style={{maxWidth: 800, marginBottom: "1rem"}}>
                <Input.Search
                    placeholder="Search DRS objects by name."
                    // onChange={onSearch}
                    loading={loading || !drsUrl}
                    disabled={!drsUrl}
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
                expandedRowRender={({id, description, checksums, access_methods: accessMethods, size}) => (
                    <div style={{backgroundColor: "white", borderRadius: 3}} className="table-nested-ant-descriptions">
                        <Descriptions bordered={true}>
                            <Descriptions.Item label="ID" span={2}>
                                <span style={{fontFamily: "monospace"}}>{id}</span></Descriptions.Item>
                            <Descriptions.Item label="Size" span={1}>{filesize(size)}</Descriptions.Item>
                            <Descriptions.Item label="Checksums" span={3}>
                                {checksums.map(({type, checksum}) =>
                                    <div key={type} style={{display: "flex", gap: "0.8em", alignItems: "baseline"}}>
                                        <span style={{fontWeight: "bold"}}>{type.toLocaleUpperCase()}:</span>
                                        <span style={{fontFamily: "monospace"}}>{checksum}</span>
                                    </div>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Access Methods" span={3}>
                                {accessMethods.map(({type, access_url}, i) =>
                                    <div key={i} style={{display: "flex", gap: "0.8em", alignItems: "baseline"}}>
                                        <span style={{fontWeight: "bold"}}>{type.toLocaleUpperCase()}:</span>
                                        <span style={{fontFamily: "monospace"}}>
                                            {type === "http"
                                                ? <a href={access_url?.url} target="_blank" rel="noreferrer">
                                                    {access_url?.url}</a>
                                                : access_url?.url}
                                        </span>
                                    </div>
                                )}
                            </Descriptions.Item>
                            {description && <Descriptions.Item label="Description" span={3}>
                                {description}</Descriptions.Item>}
                        </Descriptions>
                    </div>
                )}
                locale={{
                    emptyText: doneSearch ? "No matching objects" : "Search to see matching objects",
                }}
            />
        </Layout.Content>
    </Layout>;
};

export default ManagerDRSContent;
