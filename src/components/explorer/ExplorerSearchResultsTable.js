import React, {useState, useMemo, useCallback} from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Table, Typography, Button, Spin } from "antd";
import { BarChartOutlined, ExportOutlined } from "@ant-design/icons";

import SearchSummaryModal from "./SearchSummaryModal";
import SearchTracksModal from "./SearchTracksModal";

import {
    setSelectedRows,
    performIndividualsDownloadCSVIfPossible,
    performBiosamplesDownloadCSVIfPossible,
    performExperimentsDownloadCSVIfPossible,
    setTableSortOrder,
} from "@/modules/explorer/actions";

const PAGE_SIZE = 25;

const ExplorerSearchResultsTable = ({
    data,
    activeTab,
    columns,
    currentPage: initialCurrentPage,
    sortOrder,
    sortColumnKey,
}) => {
    const { dataset } = useParams();
    const [currentPage, setCurrentPage] = useState(initialCurrentPage || 1);
    const [activeFilters, setActiveFilters] = useState([]);

    const [summaryModalVisible, setSummaryModalVisible] = useState(false);
    const [tracksModalVisible, setTracksModalVisible] = useState(false);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            return Object.keys(activeFilters).every((filterKey) => {
                const filterValues = activeFilters[filterKey] || [];
                if (filterValues.length === 0) {
                    return true;
                }
                return filterValues.includes(item[filterKey]);
            });
        });
    }, [data, activeFilters]);

    const numResults = useMemo(() => filteredData.length, [filteredData]);

    const showingResults = useMemo(() => {
        const start = numResults > 0 ? currentPage * PAGE_SIZE - PAGE_SIZE + 1 : 0;
        const end = Math.min(currentPage * PAGE_SIZE, numResults);
        return `Showing results ${start}-${end} of ${numResults}`;
    }, [currentPage, PAGE_SIZE, numResults]);

    const searchResults = useSelector((state) => state.explorer.searchResultsByDatasetID[dataset] || null);
    const selectedRows = useSelector((state) => state.explorer.selectedRowsByDatasetID[dataset]);
    const isFetchingDownload = useSelector((state) => state.explorer.isFetchingDownload || false);
    const fetchingSearch = useSelector((state) => state.explorer.fetchingSearchByDatasetID[dataset] || false);
    const dispatch = useDispatch();

    const handleSetSelectedRows = useCallback(
        (...args) => dispatch(setSelectedRows(dataset, ...args)),
        [dispatch, dataset]);

    const handlePerformDownloadCSVIfPossible = useCallback((...args) => {
        if (activeTab === "individuals") {
            return dispatch(performIndividualsDownloadCSVIfPossible(dataset, ...args));
        }
        if (activeTab === "biosamples") {
            return dispatch(performBiosamplesDownloadCSVIfPossible(dataset, ...args));
        }
        if (activeTab === "experiments") {
            return dispatch(performExperimentsDownloadCSVIfPossible(dataset, ...args));
        }
    }, [dispatch, dataset, activeTab]);

    const onTableChange = useCallback((pageObj, filters, sorter) => {
        const newPage = filters !== activeFilters ? 1 : pageObj.current;
        setCurrentPage(newPage);
        setActiveFilters(filters);
        dispatch(setTableSortOrder(dataset, sorter.field, sorter.order, activeTab, newPage));
    }, [dispatch, dataset, activeTab]);

    const tableStyle = useMemo(() => ({
        opacity: fetchingSearch ? 0.5 : 1,
        pointerEvents: fetchingSearch ? "none" : "auto",
    }), [fetchingSearch]);

    const rowSelection = useMemo(() => ({
        type: "checkbox",
        selectedRowKeys: selectedRows ?? [],
        onChange: (selectedRowKeys) => {
            handleSetSelectedRows(selectedRowKeys);
        },
        selections: [
            {
                key: "all-data",
                text: "Select All Data",
                onSelect: () => {
                    const filteredKeys = filteredData.map((item) => item.key);
                    handleSetSelectedRows(filteredKeys);
                },
            },
            {
                key: "unselect-all-data",
                text: "Unselect all data",
                onSelect: () => handleSetSelectedRows([]),
            },
        ],
    }), [selectedRows, data, handleSetSelectedRows]);

    const sortedInfo = useMemo(
        () => ({
            order: sortOrder,
            columnKey: sortColumnKey,
        }),
        [sortOrder, sortColumnKey],
    );

    return (
        <div>
            <Typography.Title level={4}>
                {showingResults}
                <Spin style={{ marginLeft: "35px" }} spinning={fetchingSearch}></Spin>
                <div style={{ float: "right", verticalAlign: "top" }}>
                    {/* TODO: new "visualize tracks" functionality */}
                    {/* <Button icon="profile"
                                style={{marginRight: "8px"}}
                                onClick={() => this.setState({tracksModalVisible: true})}
                                disabled={true}>
                            Visualize Tracks</Button> */}

                    <Button
                        icon={<BarChartOutlined />}
                        style={{ marginRight: "8px" }}
                        onClick={() => setSummaryModalVisible(true)}
                    >
                        View Summary
                    </Button>
                    <Button
                        icon={<ExportOutlined />}
                        style={{ marginRight: "8px" }}
                        loading={isFetchingDownload}
                        onClick={() => handlePerformDownloadCSVIfPossible(selectedRows ?? [], data)}
                    >
                        Export as CSV
                    </Button>
                </div>
            </Typography.Title>
            {summaryModalVisible && (
                <SearchSummaryModal
                    searchResults={searchResults}
                    open={summaryModalVisible}
                    onCancel={() => setSummaryModalVisible(false)}
                />
            )}
            {tracksModalVisible && (
                <SearchTracksModal
                    searchResults={searchResults}
                    open={tracksModalVisible}
                    onCancel={() => setTracksModalVisible(false)}
                />
            )}
            <div style={tableStyle}>
                <Table
                    bordered
                    disabled={fetchingSearch}
                    size="middle"
                    columns={columns}
                    dataSource={data || []}
                    sortedInfo={sortedInfo}
                    onChange={onPageChange}
                    pagination={{
                        pageSize: PAGE_SIZE,
                        defaultCurrent: currentPage,
                        showSizeChanger: false,
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

ExplorerSearchResultsTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    activeTab: PropTypes.string.isRequired,
    columns: PropTypes.arrayOf(PropTypes.object).isRequired,
    sortOrder: PropTypes.string,
    sortColumnKey: PropTypes.string,
    currentPage: PropTypes.number,
};

export default ExplorerSearchResultsTable;
