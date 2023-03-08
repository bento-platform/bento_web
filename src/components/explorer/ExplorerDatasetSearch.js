import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";

import { Typography, Tabs } from "antd";

import "./explorer.css";

import DiscoveryQueryBuilder from "../discovery/DiscoveryQueryBuilder";
import SearchAllRecords from "./SearchAllRecords";

import { datasetPropTypesShape } from "../../propTypes";
import {
    addDataTypeQueryForm,
    performSearchIfPossible,
    removeDataTypeQueryForm,
    updateDataTypeQueryForm,
    setSelectedRows,
    setTableSortOrder,
    performIndividualsDownloadCSVIfPossible,
} from "../../modules/explorer/actions";
import { withBasePath } from "../../utils/url";
import ExplorerSearchResultsTableComp from "./ExplorerSearchResultsTableComp";

const individualRender = (individual) => {
    const alternateIds = individual.alternate_ids ?? [];
    const listRender = alternateIds.length ? " (" + alternateIds.join(", ") + ")" : "";
    return (
        <>
            <Link
                to={(location) => ({
                    pathname: withBasePath(`data/explorer/individuals/${individual.id}/overview`),
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
                {samples.join(", ")}
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
                {experiments} Experiment{experiments === 1 ? "" : "s"}
            </>
        ),
        sorter: (a, b) => a.experiments - b.experiments,
        sortDirections: ["descend", "ascend", "descend"],
    },
];

const { TabPane } = Tabs;
class ExplorerDatasetSearch extends Component {
    constructor(props) {
        super(props);
        this.onPageChange = this.onPageChange.bind(this);
        this.resetPageNumber = this.resetPageNumber.bind(this);
        this.newTabIndex = 0;

        this.state = {
            currentPage: 1,
            activeKey: "1",
        };

        // Ensure user is at the top of the page after transition
        window.scrollTo(0, 0);
    }

    onCallback = (activeKey) => {
        console.log("activeKey: ", activeKey);
        this.setState({ activeKey });
    };

    onPageChange(pagination, _, sorter) {
        this.setState({ currentPage: pagination.current });
        this.props.setTableSortOrder(sorter.columnKey, sorter.order);
    }

    resetPageNumber() {
        this.setState({ currentPage: 1 });
        this.props.performSearchIfPossible();
    }

    renderSearchResultsTabPane = (data, tabKey, dataStructure, type) => {
        return (
            <TabPane tab={tabKey} key={tabKey}>
                <ExplorerSearchResultsTableComp dataStructure={dataStructure} type={type} data={data} />
            </TabPane>
        );
    };

    render() {
        if (!this.props.match.params.dataset) return null; // TODO

        const selectedDataset = this.props.datasetsByID[this.props.match.params.dataset];

        if (!selectedDataset) return null; // TODO

        const isFetchingSearchResults = this.props.fetchingSearch || this.props.fetchingTextSearch;

        return (
            <>
                <Typography.Title level={4}>Explore Dataset {selectedDataset.title}</Typography.Title>
                <SearchAllRecords datasetID={this.props.match.params.dataset} />
                <DiscoveryQueryBuilder
                    isInternal={true}
                    dataTypeForms={this.props.dataTypeForms}
                    onSubmit={this.resetPageNumber}
                    searchLoading={this.props.fetchingSearch}
                    addDataTypeQueryForm={this.props.addDataTypeQueryForm}
                    updateDataTypeQueryForm={this.props.updateDataTypeQueryForm}
                    removeDataTypeQueryForm={this.props.removeDataTypeQueryForm}
                />
                {this.props.searchResults && !isFetchingSearchResults && (
                    <Tabs defaultActiveKey="1" onChange={this.onCallback}>
                        {/* TODO: change depending on katsu update */}
                        {this.props.searchResults.searchFormattedResults && (
                            <TabPane tab="Individual" key="1">
                                <ExplorerSearchResultsTableComp
                                    dataStructure={SEARCH_RESULT_COLUMNS}
                                    type="individual"
                                    data={this.props.searchResults.searchFormattedResults}
                                />
                            </TabPane>
                        )}
                    </Tabs>
                )}
            </>
        );
    }
}

ExplorerDatasetSearch.propTypes = {
    // chordServices: PropTypes.arrayOf(PropTypes.object), // todo: more detail

    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    fetchingSearch: PropTypes.bool,
    fetchingTextSearch: PropTypes.bool,
    searchResults: PropTypes.object,
    selectedRows: PropTypes.arrayOf(PropTypes.string),
    tableSortOrder: PropTypes.object,

    addDataTypeQueryForm: PropTypes.func.isRequired,
    updateDataTypeQueryForm: PropTypes.func.isRequired,
    removeDataTypeQueryForm: PropTypes.func.isRequired,
    performSearchIfPossible: PropTypes.func.isRequired,
    setSelectedRows: PropTypes.func.isRequired,
    setTableSortOrder: PropTypes.func,

    performIndividualsDownloadCSVIfPossible: PropTypes.func.isRequired,
    isFetchingDownload: PropTypes.bool,

    datasetsByID: PropTypes.objectOf(datasetPropTypesShape),
};

const mapStateToProps = (state, ownProps) => {
    const datasetID = ownProps.match.params.dataset;
    return {
        // chordServices: state.services,

        dataTypeForms: state.explorer.dataTypeFormsByDatasetID[datasetID] || [],
        fetchingSearch: state.explorer.fetchingSearchByDatasetID[datasetID] || false,
        fetchingTextSearch: state.explorer.fetchingTextSearch || false,
        searchResults: state.explorer.searchResultsByDatasetID[datasetID] || null,
        selectedRows: state.explorer.selectedRowsByDatasetID[datasetID] || [],
        tableSortOrder: state.explorer.tableSortOrderByDatasetID[datasetID] || {},

        isFetchingDownload: state.explorer.isFetchingDownload || false,

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
            setTableSortOrder,
            performIndividualsDownloadCSVIfPossible,
        }).map(([k, v]) => [k, (...args) => dispatch(v(ownProps.match.params.dataset, ...args))])
    );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExplorerDatasetSearch));
