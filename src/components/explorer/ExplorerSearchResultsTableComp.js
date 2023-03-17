import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Table, Typography, Button, Spin } from "antd";

import SearchSummaryModal from "./SearchSummaryModal";
import SearchTracksModal from "./SearchTracksModal";

import { setSelectedRows, performIndividualsDownloadCSVIfPossible } from "../../modules/explorer/actions";

const ExplorerSearchResultsTableComp = ({ data, ...props }) => {
    const { dataset } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(25);
    const [numResults, setNumResults] = useState(0);

    const [summaryModalVisible, setSummaryModalVisible] = useState(false);
    const [tracksModalVisible, setTracksModalVisible] = useState(false);

    const showingResults = useMemo(() => {
        const start = numResults > 0 ? currentPage * pageSize - pageSize + 1 : 0;
        const end = Math.min(currentPage * pageSize, numResults);
        return `Showing results ${start}-${end} of ${numResults}`;
    }, [currentPage, pageSize, numResults]);

    const searchResults = useSelector((state) => state.explorer.searchResultsByDatasetID[dataset] || null);
    const selectedRows = useSelector((state) => state.explorer.selectedRowsByDatasetID[dataset] || []);
    const isFetchingDownload = useSelector((state) => state.explorer.isFetchingDownload || false);
    const fetchingSearch = useSelector((state) => state.explorer.fetchingSearchByDatasetID[dataset] || false);

    const dispatch = useDispatch();

    const handleSetSelectedRows = (...args) => dispatch(setSelectedRows(dataset, ...args));
    const handlePerformIndividualsDownloadCSVIfPossible = (...args) =>
        dispatch(performIndividualsDownloadCSVIfPossible(dataset, ...args));

    const onPageChange = (pageObj) => {
        setCurrentPage(pageObj.current);
    };

    const tableStyle = {
        opacity: fetchingSearch ? 0.5 : 1,
        pointerEvents: fetchingSearch ? "none" : "auto",
    };

    useEffect(() => {
        setNumResults(data.length);
    }, [currentPage, pageSize]);

    const rowSelection = {
        type: "checkbox",
        selectedRowKeys: selectedRows,
        onChange: (selectedRowKeys) => {
            handleSetSelectedRows(selectedRowKeys);
        },
        selections: [
            {
                key: "all-data",
                text: "Select All Data",
                onSelect: () => {
                    const allRowKeys = data.map((item) => item.key);
                    handleSetSelectedRows(allRowKeys);
                },
            },
            {
                key: "unselect-all-data",
                text: "Unselect all data",
                onSelect: () => handleSetSelectedRows([]),
            },
        ],
    };

    return (
        <div>
            <Typography.Title level={4}>
                {showingResults}
                <Spin style={{ marginLeft: "35px" }} spinning={fetchingSearch}></Spin>
                <div style={{ float: "right", verticalAlign: "top" }}>
                    <Spin spinning={isFetchingDownload} style={{ display: "inline-block !important" }}>
                        <Button
                            icon="export"
                            style={{ marginRight: "8px" }}
                            disabled={isFetchingDownload}
                            onClick={() => handlePerformIndividualsDownloadCSVIfPossible(selectedRows, data)}
                        >
                            Export as CSV
                        </Button>
                    </Spin>
                </div>
            </Typography.Title>
            {summaryModalVisible && (
                <SearchSummaryModal
                    searchResults={searchResults}
                    visible={summaryModalVisible}
                    onCancel={() => setSummaryModalVisible(false)}
                />
            )}
            {tracksModalVisible && (
                <SearchTracksModal
                    searchResults={searchResults}
                    visible={tracksModalVisible}
                    onCancel={() => setTracksModalVisible(false)}
                />
            )}
            <div style={tableStyle}>
                <Table
                    bordered
                    disabled={fetchingSearch}
                    size="middle"
                    columns={props.dataStructure}
                    dataSource={data || []}
                    onChange={onPageChange}
                    pagination={{
                        pageSize: pageSize,
                        defaultCurrent: currentPage,
                        showQuickJumper: true,
                    }}
                    rowKey={(record) => {
                        return record.key;
                    }}
                    rowSelection={rowSelection}
                />
            </div>
        </div>
    );
};

ExplorerSearchResultsTableComp.defaultProps = {
    fetchingSearch: false,
    searchResults: null,
    selectedRows: [],
    dataStructure: [],
    setSelectedRows: () => {},
    performIndividualsDownloadCSVIfPossible: () => {},
    isFetchingDownload: false,
    type: "",
    data: [],
};

ExplorerSearchResultsTableComp.propTypes = {
    fetchingSearch: PropTypes.bool,
    searchResults: PropTypes.object,
    selectedRows: PropTypes.arrayOf(PropTypes.string),
    dataStructure: PropTypes.arrayOf(PropTypes.object),
    setSelectedRows: PropTypes.func.isRequired,
    isFetchingDownload: PropTypes.bool,
    performIndividualsDownloadCSVIfPossible: PropTypes.func.isRequired,
    type: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
};

export default ExplorerSearchResultsTableComp;
