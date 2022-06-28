import React, { useState } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";

import { Button, Table, Typography, Spin } from "antd";

import "./explorer.css";

import DiscoveryQueryBuilder from "../discovery/DiscoveryQueryBuilder";
import SearchSummaryModal from "./SearchSummaryModal";
import SearchAllRecords from "./SearchAllRecords";

import { datasetPropTypesShape } from "../../propTypes";
import {
    addDataTypeQueryForm,
    performSearchIfPossible,
    removeDataTypeQueryForm,
    updateDataTypeQueryForm,
    setSelectedRows,
    performIndividualsDownloadCSVIfPossible,
} from "../../modules/explorer/actions";
import { withBasePath } from "../../utils/url";
import SearchTracksModal from "./SearchTracksModal";

const individualRender = (individual) => {
    const alternateIds = individual.alternate_ids ?? [];
    const listRender = alternateIds.length
        ? " (" + alternateIds.join(", ") + ")"
        : "";
    return (
        <>
            <Link
                to={(location) => ({
                    pathname: withBasePath(
                        `data/explorer/individuals/${individual.id}/overview`
                    ),
                    state: { backUrl: location.pathname },
                })}
            >
                {individual.id}
            </Link>{" "}
            {listRender}
        </>
    );
};

const SEARCH_RESULT_COLUMNS = [
    {
        title: "Individual",
        dataIndex: "individual",
        render: (individual) => individualRender(individual),
        sorter: (a, b) => a.individual.id.localeCompare(b.individual.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Samples",
        dataIndex: "biosamples",
        render: (samples) => (
            <>
                {samples.length} Sample{samples.length === 1 ? "" : "s"}
                {samples.length ? ": " : ""}
                {samples.map((b) => b.id).join(", ")}
            </>
        ),
        sorter: (a, b) => a.biosamples.length - b.biosamples.length,
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Experiments",
        dataIndex: "experiments",
        render: (experiments) => (
            <>
                {experiments.length} Experiment
                {experiments.length === 1 ? "" : "s"}
            </>
        ),
        sorter: (a, b) => a.experiments.length - b.experiments.length,
        sortDirections: ["descend", "ascend", "descend"],
    },
];

const ExplorerDatasetSearch = ({
    dataTypeForms,
    fetchingSearch,
    searchResults,
    selectedRows,
    addDataTypeQueryForm,
    updateDataTypeQueryForm,
    removeDataTypeQueryForm,
    performSearchIfPossible,
    setSelectedRows,
    performIndividualsDownloadCSVIfPossible,
    isFetchingDownload,
    datasetsByID,
    match,
}) => {
    // Ensure user is at the top of the page after transition
    window.scrollTo(0, 0);

    const [summaryModalVisible, setSummaryModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [tracksModalVisible, setTracksModalVisible] = useState(false);

    const pageSize = 25;

    const onPageChange = (pageObj) => {
        //console.log("On page: " + pageObj.current + " with page size: " + pageObj.pageSize);
        setCurrentPage(pageObj.current);
    };

    const resetPageNumber = () => {
        performSearchIfPossible();

        //this.setState({currentPage: 1});
        // Not-so-React-y way of setting the current data table to page 1
        // in the event a new search query results in an equal-or-longer dataset.
        // Without such a mechanism, the user will find themself on the same page they
        // were on with their last query
        try {
            document
                .getElementsByClassName(
                    "ant-pagination-item ant-pagination-item-1"
                )[0]
                .click();
        } catch (error) {
            console.error(error);
        }
    };

    if (!match.params.dataset) return null; // TODO

    const selectedDataset = datasetsByID[match.params.dataset];

    if (!selectedDataset) return null; // TODO

    const numResults = (searchResults || { searchFormattedResults: [] })
        .searchFormattedResults.length;

    const tableStyle = {
        opacity: fetchingSearch ? 0.5 : 1,
        pointerEvents: fetchingSearch ? "none" : "auto",
    };

    // Calculate page numbers and range
    const showingResults =
        numResults > 0 ? currentPage * pageSize - pageSize + 1 : 0;

    console.log("search results: " + searchResults);

    return (
        <>
            <Typography.Title level={4}>
                Explore Dataset {selectedDataset.title}
            </Typography.Title>
            <SearchAllRecords datasetID={match.params.dataset} />
            <DiscoveryQueryBuilder
                isInternal={true}
                dataTypeForms={dataTypeForms}
                onSubmit={resetPageNumber}
                searchLoading={fetchingSearch}
                addDataTypeQueryForm={addDataTypeQueryForm}
                updateDataTypeQueryForm={updateDataTypeQueryForm}
                removeDataTypeQueryForm={removeDataTypeQueryForm}
            />
            {searchResults && !fetchingSearch ? (
                <>
                    <Typography.Title level={4}>
                        Showing results {showingResults}-
                        {Math.min(currentPage * pageSize, numResults)} of{" "}
                        {numResults}
                        <Spin
                            style={{ marginLeft: "35px" }}
                            spinning={fetchingSearch}
                        ></Spin>
                        <div style={{ float: "right", verticalAlign: "top" }}>
                            {/* TODO: new "visualize tracks" functionality */}
                            {/* <Button icon="profile"
                            style={{marginRight: "8px"}}
                            onClick={() => this.setState({tracksModalVisible: true})}
                            disabled={true}>
                        Visualize Tracks</Button> */}
                            <Button
                                icon="bar-chart"
                                style={{ marginRight: "8px" }}
                                onClick={() => setSummaryModalVisible(true)}
                            >
                                View Summary
                            </Button>
                            <Spin
                                spinning={isFetchingDownload}
                                style={{
                                    display: "inline-block !important",
                                }}
                            >
                                <Button
                                    icon="export"
                                    style={{ marginRight: "8px" }}
                                    disabled={isFetchingDownload}
                                    onClick={() =>
                                        performIndividualsDownloadCSVIfPossible(
                                            selectedRows,
                                            searchResults.searchFormattedResults
                                        )
                                    }
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
                    <SearchTracksModal
                        searchResults={searchResults}
                        visible={tracksModalVisible}
                        onCancel={() => setTracksModalVisible(false)}
                    />
                    <div style={tableStyle}>
                        <Table
                            bordered
                            disabled={fetchingSearch}
                            size="middle"
                            columns={SEARCH_RESULT_COLUMNS}
                            dataSource={
                                searchResults.searchFormattedResults || []
                            }
                            pagination={{
                                pageSize: pageSize,
                                defaultCurrent: currentPage,
                                showQuickJumper: true,
                            }}
                            onChange={onPageChange}
                            rowSelection={{
                                selectedRowKeys: selectedRows,
                                onChange: setSelectedRows,
                                selections: [
                                    {
                                        key: "select-all-data",
                                        text: "Select all data",
                                        onSelect: () =>
                                            setSelectedRows(
                                                (
                                                    searchResults.searchFormattedResults ||
                                                    []
                                                ).map((r) => r.key)
                                            ),
                                    },
                                    {
                                        key: "unselect-all-data",
                                        text: "Unselect all data",
                                        onSelect: () => setSelectedRows([]),
                                    },
                                ],
                            }}
                        />
                    </div>
                </>
            ) : null}
        </>
    );
};

ExplorerDatasetSearch.propTypes = {
    // chordServices: PropTypes.arrayOf(PropTypes.object), // todo: more detail

    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    fetchingSearch: PropTypes.bool,
    searchResults: PropTypes.object,
    selectedRows: PropTypes.arrayOf(PropTypes.string),

    addDataTypeQueryForm: PropTypes.func.isRequired,
    updateDataTypeQueryForm: PropTypes.func.isRequired,
    removeDataTypeQueryForm: PropTypes.func.isRequired,
    performSearchIfPossible: PropTypes.func.isRequired,
    setSelectedRows: PropTypes.func.isRequired,

    performIndividualsDownloadCSVIfPossible: PropTypes.func.isRequired,
    isFetchingDownload: PropTypes.bool,

    datasetsByID: PropTypes.objectOf(datasetPropTypesShape),
};

const mapStateToProps = (state, ownProps) => {
    const datasetID = ownProps.match.params.dataset;
    return {
        // chordServices: state.services,

        dataTypeForms: state.explorer.dataTypeFormsByDatasetID[datasetID] || [],
        fetchingSearch:
            state.explorer.fetchingSearchByDatasetID[datasetID] || false,
        searchResults:
            state.explorer.searchResultsByDatasetID[datasetID] || null,
        selectedRows: state.explorer.selectedRowsByDatasetID[datasetID] || [],

        isFetchingDownload: state.explorer.isFetchingDownload || false,

        datasetsByID: Object.fromEntries(
            state.projects.items.flatMap((p) =>
                p.datasets.map((d) => [
                    d.identifier,
                    { ...d, project: p.identifier },
                ])
            )
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
        }).map(([k, v]) => [
            k,
            (...args) => dispatch(v(ownProps.match.params.dataset, ...args)),
        ])
    );

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ExplorerDatasetSearch)
);
