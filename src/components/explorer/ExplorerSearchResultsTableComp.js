import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table, Typography, Button, Spin } from "antd";

import { datasetPropTypesShape, serviceInfoPropTypesShape } from "../../propTypes";

import SearchSummaryModal from "./SearchSummaryModal";
import SearchTracksModal from "./SearchTracksModal";

import {
    addDataTypeQueryForm,
    performSearchIfPossible,
    removeDataTypeQueryForm,
    updateDataTypeQueryForm,
    setSelectedRows,
    performIndividualsDownloadCSVIfPossible,
} from "../../modules/explorer/actions";

const ExplorerSearchResultsTableComp = ({ data, ...props }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(25);
    const [numResults, setNumResults] = useState(0);

    const [summaryModalVisible, setSummaryModalVisible] = useState(false);
    const [tracksModalVisible, setTracksModalVisible] = useState(false);

    const onPageChange = (pageObj) => {
        setCurrentPage(pageObj.current);
    };

    const tableStyle = {
        opacity: props.fetchingSearch ? 0.5 : 1,
        pointerEvents: props.fetchingSearch ? "none" : "auto",
    };

    useEffect(() => {
        setNumResults(data.length);
    }, [currentPage, pageSize]);

    const rowSelection = {
        type: "checkbox",
        selectedRowKeys: props.selectedRows,
        onChange: (selectedRowKeys) => {
            props.setSelectedRows(selectedRowKeys);
        },
        selections: [
            {
                key: "all-data",
                text: "Select All Data",
                onSelect: () => {
                    const allRowKeys = data.map((item) => item.key);
                    props.setSelectedRows(allRowKeys);
                },
            },
            {
                key: "unselect-all-data",
                text: "Unselect all data",
                onSelect: () => props.setSelectedRows([]),
            },
        ],
    };

    const getShowingResults = () => {
        const start = numResults > 0 ? currentPage * pageSize - pageSize + 1 : 0;
        const end = Math.min(currentPage * pageSize, numResults);
        return `Showing results ${start}-${end} of ${numResults}`;
    };

    return (
        <div>
            <Typography.Title level={4}>
                {getShowingResults()}
                <Spin style={{ marginLeft: "35px" }} spinning={props.fetchingSearch}></Spin>
                <div style={{ float: "right", verticalAlign: "top" }}>
                    <Spin spinning={props.isFetchingDownload} style={{ display: "inline-block !important" }}>
                        <Button
                            icon="export"
                            style={{ marginRight: "8px" }}
                            disabled={props.isFetchingDownload}
                            onClick={() => props.performIndividualsDownloadCSVIfPossible(props.selectedRows, data)}
                        >
                            Export as CSV
                        </Button>
                    </Spin>
                </div>
            </Typography.Title>
            {summaryModalVisible && (
                <SearchSummaryModal
                    searchResults={props.searchResults}
                    visible={summaryModalVisible}
                    onCancel={() => setSummaryModalVisible(false)}
                />
            )}
            {tracksModalVisible && (
                <SearchTracksModal
                    searchResults={props.searchResults}
                    visible={tracksModalVisible}
                    onCancel={() => setTracksModalVisible(false)}
                />
            )}
            <div style={tableStyle}>
                <Table
                    bordered
                    disabled={props.fetchingSearch}
                    size="middle"
                    columns={props.dataStructure}
                    dataSource={data || []} //jul
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
    dataTypeForms: [],
    fetchingSearch: false,
    searchResults: null,
    selectedRows: [],
    dataStructure: [],
    isFetchingDownload: false,
    type: "",
    data: [],
};

ExplorerSearchResultsTableComp.propTypes = {
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    fetchingSearch: PropTypes.bool,
    searchResults: PropTypes.object,
    selectedRows: PropTypes.arrayOf(PropTypes.string),

    dataStructure: PropTypes.arrayOf(PropTypes.object),
    setSelectedRows: PropTypes.func.isRequired,

    isFetchingDownload: PropTypes.bool,
    performIndividualsDownloadCSVIfPossible: PropTypes.func.isRequired,

    federationServiceInfo: serviceInfoPropTypesShape,
    datasetsByID: PropTypes.objectOf(datasetPropTypesShape),

    type: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
};

const mapStateToProps = (state, ownProps) => {
    const datasetID = ownProps.match.params.dataset;
    return {
        // chordServices: state.services,
        searchResults: state.explorer.searchResultsByDatasetID[datasetID] || null,
        selectedRows: state.explorer.selectedRowsByDatasetID[datasetID] || [],
        isFetchingDownload: state.explorer.isFetchingDownload || false,
        //
        dataTypeForms: state.explorer.dataTypeFormsByDatasetID[datasetID] || [],
        fetchingSearch: state.explorer.fetchingSearchByDatasetID[datasetID] || false,

        federationServiceInfo: state.services.federationService,
        datasetsByID: Object.fromEntries(
            state.projects.items.flatMap((p) => p.datasets.map((d) => [d.identifier, { ...d, project: p.identifier }]))
        ),
    };
};

// Map datasetID to the front argument of these actions and add dispatching
const mapDispatchToProps = (dispatch, ownProps) =>
    Object.fromEntries(
        Object.entries({
            addDataTypeQueryForm,
            updateDataTypeQueryForm,
            removeDataTypeQueryForm,
            performSearchIfPossible,
            setSelectedRows,
            performIndividualsDownloadCSVIfPossible,
        }).map(([k, v]) => [k, (...args) => dispatch(v(ownProps.match.params.dataset, ...args))])
    );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExplorerSearchResultsTableComp));
