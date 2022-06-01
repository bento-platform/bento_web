import React, { useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Icon, Layout, Table } from "antd";

import SitePageHeader from "./SitePageHeader";

import { SITE_NAME } from "../constants";

const PeersContent = ({ nodeInfo, peers, isFetchingPeers }) => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Peers`;
    }, []);

    const peerColumns = [
        {
            title: "",
            key: "icon",
            width: 75,
            render: (_, peer) => (
                <div style={{ width: "100%", textAlign: "center" }}>
                    <Icon
                        type={
                            nodeInfo.CHORD_URL === peer.url ? "home" : "global"
                        }
                    />
                </div>
            ),
        },
        {
            title: "Peer",
            dataIndex: "url",
            render: (url) => (
                <>
                    <a href={url} target="_blank" rel="noreferrer noopener">
                        {url}
                    </a>
                    {nodeInfo.CHORD_URL === url ? (
                        <span style={{ marginLeft: "0.5em" }}>
                            (current node)
                        </span>
                    ) : null}
                </>
            ),
            sorter: (a, b) => a.url.localeCompare(b.url),
            defaultSortOrder: "ascend",
        },
    ];

    return (
        <>
            <SitePageHeader
                title="Peers"
                subTitle="Other Bento nodes connected to this one"
            />
            <Layout>
                <Layout.Content
                    style={{
                        background: "white",
                        padding: "32px 24px 4px",
                    }}
                >
                    <Table
                        dataSource={peers}
                        columns={peerColumns}
                        loading={isFetchingPeers}
                        rowKey="url"
                        bordered={true}
                        size="middle"
                    />
                </Layout.Content>
            </Layout>
        </>
    );
};

PeersContent.propTypes = {
    nodeInfo: PropTypes.shape({
        CHORD_URL: PropTypes.string,
    }),
    peers: PropTypes.arrayOf(PropTypes.string),
    isFetchingPeers: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    nodeInfo: state.nodeInfo.data,
    peers: state.peers.items.map((p) => ({ url: p })),
    isFetchingPeers: state.services.isFetchingAll || state.peers.isFetching,
});

export default connect(mapStateToProps)(PeersContent);
