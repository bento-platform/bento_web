import React, { Fragment, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import {
    Button,
    Col,
    Collapse,
    Empty,
    Icon,
    Modal,
    Popover,
    Row,
    Spin,
    Table,
    Typography,
} from "antd";

import DataUseDisplay from "../DataUseDisplay";
import { selectSearch } from "../../modules/discovery/actions";
import { nodeInfoDataPropTypesShape } from "../../propTypes";

const SearchList = ({
    nodeInfo,
    searches,
    selectedSearch,
    searchLoading,
    selectSearch,
}) => {
    // TODO: Redux?
    const [dataUseTermsModalShown, setDataUseTermsModalShown] = useState(false);
    const [dataset, setDataset] = useState(null);

    const handleSearchSelect = (searchIndex) => {
        selectSearch(searchIndex === null ? null : parseInt(searchIndex, 10));
    };

    const handleDatasetTermsClick = (dataset) => {
        setDataUseTermsModalShown(true);
        setDataset(dataset);
    };

    const handleDatasetTermsCancel = () => {
        setDataUseTermsModalShown(false);
    };

    const searchResultColumns = [
        {
            title: "Node",
            dataIndex: "node",
            width: 75,
            render: (node) => (
                /* TODO: Don't show icon if the current node is just for exploration (vFuture) */
                <Popover
                    content={
                        <>
                            <a
                                href={node}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                {node}
                            </a>
                            {nodeInfo.CHORD_URL === node ? (
                                <span style={{ marginLeft: "0.5em" }}>
                                    (current node)
                                </span>
                            ) : null}
                        </>
                    }
                >
                    <div style={{ width: "100%", textAlign: "center" }}>
                        <Icon
                            type={
                                nodeInfo.CHORD_URL === node ? "home" : "global"
                            }
                        />
                    </div>
                </Popover>
            ),
        },
        {
            title: "Dataset ID",
            dataIndex: "identifier",
            sorter: (a, b) => a.identifier.localeCompare(b.identifier),
            render: (_, dataset) => (
                <a
                    target="_blank"
                    rel="noreferrer noopener"
                    href={`${dataset.node}data/sets/${dataset.identifier}`}
                    style={{ fontFamily: "monospace" }}
                >
                    {dataset.identifier}
                </a>
            ),
        },
        {
            title: "Title",
            dataIndex: "title",
            sorter: (a, b) => a.title.localeCompare(b.title),
            defaultSortOrder: "ascend",
        },
        {
            title: "Contact Information",
            dataIndex: "contact_info",
            render: (contactInfo) =>
                (contactInfo || "").split("\n").map((p, i) => (
                    <Fragment key={i}>
                        {p}
                        <br />
                    </Fragment>
                )),
        },
        {
            title: "Actions",
            dataIndex: "actions",
            render: (_, dataset) => (
                <Row type="flex">
                    <Col>
                        <Button
                            type="link"
                            onClick={() => handleDatasetTermsClick(dataset)}
                        >
                            Data Use &amp; Consent
                        </Button>
                    </Col>
                    {/* TODO: Implement manage button v0.2
                    {dataset.node === nodeURL && user.chord_user_role === "owner" ? (
                       <Col>
                           <Button type="link" onClick={() => {}}>
                               Manage
                           </Button>
                       </Col>
                    ) : null}
                    <Col>
                    <Button type="link">/!*
                                        TODO: Real actions *!/Request Access</Button>
                    </Col> */}
                </Row>
            ),
        },
    ];

    if (!searches || searches.length === 0)
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No Searches"
            />
        );

    const datasetNameOrID = (dataset || {}).name || (dataset || {}).id || "";
    const dataUseTermsTitle = `Dataset ${datasetNameOrID.substr(0, 18)}${
        datasetNameOrID ? "…" : ""
    }: Data Use Terms`;

    return (
        <>
            <Modal
                title={dataUseTermsTitle}
                visible={dataUseTermsModalShown}
                onCancel={handleDatasetTermsCancel}
                footer={null}
            >
                <DataUseDisplay dataUse={(dataset || {}).data_use} />
            </Modal>
            <Spin spinning={searchLoading}>
                <Collapse
                    bordered={true}
                    accordion={true}
                    activeKey={(selectedSearch || 0).toString(10)}
                    onChange={(i) => handleSearchSelect(i)}
                >
                    {[...searches].reverse().map((s, i) => {
                        const searchResults = Object.entries(s.results).flatMap(
                            ([n, r]) =>
                                r ? r.map((d) => ({ ...d, node: n })) : []
                        ); // TODO: Report node response errors
                        const title = `Search ${searches.length - i}: ${
                            searchResults.length
                        } result${searchResults.length === 1 ? "" : "s"}`;
                        return (
                            <Collapse.Panel
                                header={title}
                                key={(searches.length - i - 1).toString(10)}
                            >
                                <Typography.Title level={4}>
                                    Nodes Responded:&nbsp;
                                    <span style={{ fontWeight: "normal" }}>
                                        {
                                            Object.values(s.results).filter(
                                                (r) => r !== null
                                            ).length
                                        }
                                        &nbsp;/&nbsp;
                                        {Object.keys(s.results).length}
                                    </span>
                                </Typography.Title>
                                <Typography.Title level={4}>
                                    Results
                                </Typography.Title>
                                <Table
                                    bordered={true}
                                    columns={searchResultColumns}
                                    dataSource={searchResults}
                                    rowKey="identifier"
                                />
                            </Collapse.Panel>
                        );
                    })}
                </Collapse>
            </Spin>
        </>
    );
};

SearchList.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    searches: PropTypes.array, // TODO: Shape
    selectedSearch: PropTypes.number,
    searchLoading: PropTypes.bool,

    selectSearch: PropTypes.func,
};

const mapStateToProps = (state) => ({
    nodeInfo: state.nodeInfo.data,
    user: state.auth.user,

    searches: state.discovery.searches,
    selectedSearch: state.discovery.selectedSearch,

    searchLoading: state.discovery.isFetching,
});

export default connect(mapStateToProps, { selectSearch })(SearchList);
