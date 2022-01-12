import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Table, Typography, Spin} from "antd";

import "./explorer.css";

import DiscoveryQueryBuilder from "../discovery/DiscoveryQueryBuilder";
import SearchSummaryModal from "./SearchSummaryModal";
import SearchAllRecords from "./SearchAllRecords";

import {datasetPropTypesShape, serviceInfoPropTypesShape} from "../../propTypes";
import {
    addDataTypeQueryForm,
    performSearchIfPossible,
    removeDataTypeQueryForm,
    updateDataTypeQueryForm,
    setSelectedRows,
    performIndividualsDownloadCSVIfPossible,
} from "../../modules/explorer/actions";
import {withBasePath} from "../../utils/url";
import SearchTracksModal from "./SearchTracksModal";

const SEARCH_RESULT_COLUMNS = [
    {
        title: "Individual",
        dataIndex: "individual",
        render: individual => <Link to={location => ({
            pathname: withBasePath(`data/explorer/individuals/${individual.id}/overview`),
            state: {backUrl: location.pathname},
        })}>{individual.id}</Link>,
        sorter: (a, b) => a.individual.id.localeCompare(b.individual.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Samples",
        dataIndex: "biosamples",
        render: samples => <>
            {samples.length} Sample{samples.length === 1 ? "" : "s"}{samples.length ? ": " : ""}
            {samples.map(b => b.id).join(", ")}
        </>,
        sorter: (a, b) => a.biosamples.length - b.biosamples.length,
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Experiments",
        dataIndex: "experiments",
        render: experiments => <>{experiments.length} Experiment{experiments.length === 1 ? "" : "s"}</>,
        sorter: (a, b) => a.experiments.length - b.experiments.length,
        sortDirections: ["descend", "ascend", "descend"],
    },
];


class ExplorerDatasetSearch extends Component {
    constructor(props) {
        super(props);
        this.onPageChange = this.onPageChange.bind(this);
        this.resetPageNumber = this.resetPageNumber.bind(this);

        this.state = {
            summaryModalVisible: false,
            currentPage: 1,
            pageSize: 25,
            tracksModalVisible: false
        };

        // Ensure user is at the top of the page after transition
        window.scrollTo(0, 0);
    }

    onPageChange(pageObj) {
        //console.log("On page: " + pageObj.current + " with page size: " + pageObj.pageSize);
        this.setState({currentPage: pageObj.current});
    }

    resetPageNumber() {
        this.props.performSearchIfPossible();

        //this.setState({currentPage: 1});
        // Not-so-React-y way of setting the current data table to page 1
        // in the event a new search query results in an equal-or-longer dataset.
        // Without such a mechanism, the user will find themself on the same page they
        // were on with their last query
        try {
            document.getElementsByClassName("ant-pagination-item ant-pagination-item-1")[0].click();
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        if (!this.props.match.params.dataset) return null;  // TODO

        const selectedDataset = this.props.datasetsByID[this.props.match.params.dataset];

        if (!selectedDataset) return null;  // TODO

        const numResults = (this.props.searchResults || {searchFormattedResults: []}).searchFormattedResults.length;

        const tableStyle = {
            opacity: (this.props.fetchingSearch ? 0.5 : 1),
            pointerEvents: (this.props.fetchingSearch ? "none" : "auto")
        };

        // Calculate page numbers and range
        const showingResults = numResults > 0
            ? (this.state.currentPage * this.state.pageSize) - this.state.pageSize + 1
            : 0;

        console.log("search results: " + this.props.searchResults);

        return <>
            <Typography.Title level={4}>Explore Dataset {selectedDataset.title}</Typography.Title>
            <SearchAllRecords datasetID={this.props.match.params.dataset}/>
            <DiscoveryQueryBuilder isInternal={true}
                                   dataTypeForms={this.props.dataTypeForms}
                                   onSubmit={this.resetPageNumber}
                                   searchLoading={this.props.fetchingSearch}
                                   addDataTypeQueryForm={this.props.addDataTypeQueryForm}
                                   updateDataTypeQueryForm={this.props.updateDataTypeQueryForm}
                                   removeDataTypeQueryForm={this.props.removeDataTypeQueryForm} />
            {this.props.searchResults ? <>
                <Typography.Title level={4}>
                    Showing results {showingResults}-{Math.min(this.state.currentPage * this.state.pageSize,
                    numResults)} of {numResults}
                    <Spin style={{marginLeft: "35px"}} spinning={this.props.fetchingSearch}>
                    </Spin>
                    <div style={{float: "right", verticalAlign: "top"}}>
                        <Button icon="profile"
                                style={{marginRight: "8px"}}
                                onClick={() => this.setState({tracksModalVisible: true})}
                                disabled={true}>
                            Visualize Tracks</Button>
                        <Button icon="bar-chart"
                                style={{marginRight: "8px"}}
                                onClick={() => this.setState({summaryModalVisible: true})}>View Summary</Button>
                        <Spin spinning={this.props.isFetchingDownload} style={{display: "inline-block !important"}}>
                            <Button icon="export" style={{marginRight: "8px"}}
                                    disabled={this.props.isFetchingDownload}
                                    onClick={() => this.props.performIndividualsDownloadCSVIfPossible(
                                        this.props.selectedRows, this.props.searchResults.searchFormattedResults)}>
                                Export as CSV</Button>
                        </Spin>
                    </div>
                </Typography.Title>
                {this.state.summaryModalVisible && <SearchSummaryModal searchResults={this.props.searchResults}
                                    visible={this.state.summaryModalVisible}
                                    onCancel={() => this.setState({summaryModalVisible: false})} />}
                <SearchTracksModal searchResults={this.props.searchResults}
                                   visible={this.state.tracksModalVisible}
                                   onCancel={() => this.setState({tracksModalVisible: false})} />
                    <div style={tableStyle}>
                        <Table bordered
                               disabled={this.props.fetchingSearch}
                               size="middle"
                               columns={SEARCH_RESULT_COLUMNS}
                               dataSource={this.props.searchResults.searchFormattedResults || []}
                               pagination={{
                                   pageSize: this.state.pageSize,
                                   defaultCurrent: this.state.currentPage,
                                   showQuickJumper: true
                               }}
                               onChange={this.onPageChange}
                               rowSelection={{
                                   selectedRowKeys: this.props.selectedRows,
                                   onChange: this.props.setSelectedRows,
                                   selections: [
                                       {
                                           key: "select-all-data",
                                           text: "Select all data",
                                           onSelect: () => this.props.setSelectedRows(
                                               (this.props.searchResults.searchFormattedResults || []).map(r => r.key)
                                           ),
                                       },
                                       {
                                           key: "unselect-all-data",
                                           text: "Unselect all data",
                                           onSelect: () => this.props.setSelectedRows([]),
                                       },
                                   ],
                               }} />
                    </div>
            </> : null}
        </>;
    }
}

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

    federationServiceInfo: serviceInfoPropTypesShape,
    datasetsByID: PropTypes.objectOf(datasetPropTypesShape),
};

const mapStateToProps = (state, ownProps) => {
    const datasetID = ownProps.match.params.dataset;
    return {
        // chordServices: state.services,

        dataTypeForms: state.explorer.dataTypeFormsByDatasetID[datasetID] || [],
        fetchingSearch: state.explorer.fetchingSearchByDatasetID[datasetID] || false,
        searchResults: state.explorer.searchResultsByDatasetID[datasetID] || null,
        selectedRows: state.explorer.selectedRowsByDatasetID[datasetID] || [],

        isFetchingDownload: state.explorer.isFetchingDownload || false,

        federationServiceInfo: state.services.federationService,
        datasetsByID: Object.fromEntries(state.projects.items
            .flatMap(p => p.datasets.map(d => [d.identifier, {...d, project: p.identifier}]))),
    };
};

// Map datasetID to the front argument of these actions and add dispatching
const mapDispatchToProps = (dispatch, ownProps) => Object.fromEntries(Object.entries({
    addDataTypeQueryForm,
    updateDataTypeQueryForm,
    removeDataTypeQueryForm,
    performSearchIfPossible,
    setSelectedRows,
    performIndividualsDownloadCSVIfPossible
}).map(([k, v]) => [k, (...args) => dispatch(v(ownProps.match.params.dataset, ...args))]));

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExplorerDatasetSearch));
