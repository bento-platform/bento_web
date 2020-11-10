import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DiscoveryQueryBuilder from "../discovery/DiscoveryQueryBuilder";
import SearchSummaryModal from "./SearchSummaryModal";

import {datasetPropTypesShape, serviceInfoPropTypesShape} from "../../propTypes";
import {
    addDataTypeQueryForm,
    performSearchIfPossible,
    removeDataTypeQueryForm,
    updateDataTypeQueryForm,
    setSelectedRows,
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
    },
    {
        title: "Experiments",
        dataIndex: "experiments",
        render: experiments => <>{experiments.length} Experiment{experiments.length === 1 ? "" : "s"}</>,
    },
];


class ExplorerDatasetSearch extends Component {
    constructor(props) {
        super(props);
        this.onPageChange = this.onPageChange.bind(this);

        this.state = {
            summaryModalVisible: false,
            currentPage: 1,
            pageSize: 25,
            tracksModalVisible: false
        };
    }

    onPageChange(pageObj) {
        //console.log("On page: " + pageObj.current + " with page size: " + pageObj.pageSize);
        this.setState({currentPage: pageObj.current});
    }

    render() {
        if (!this.props.match.params.dataset) return null;  // TODO

        const selectedDataset = this.props.datasetsByID[this.props.match.params.dataset];

        if (!selectedDataset) return null;  // TODO

        return <>
            <Typography.Title level={4}>Explore Dataset {selectedDataset.title}</Typography.Title>
            <DiscoveryQueryBuilder isInternal={true}
                                   dataTypeForms={this.props.dataTypeForms}
                                   onSubmit={this.props.performSearchIfPossible}
                                   searchLoading={this.props.fetchingSearch}
                                   addDataTypeQueryForm={this.props.addDataTypeQueryForm}
                                   updateDataTypeQueryForm={this.props.updateDataTypeQueryForm}
                                   removeDataTypeQueryForm={this.props.removeDataTypeQueryForm} />
            {this.props.searchResults ? <>
                <Typography.Title level={4}>
                    <span>
                        Showing results {(this.state.currentPage * this.state.pageSize) - this.state.pageSize + 1}-{
                        (this.state.currentPage * this.state.pageSize) < this.props.searchResults.searchFormattedResults.length 
                            ? (this.state.currentPage * this.state.pageSize) 
                            : this.props.searchResults.searchFormattedResults.length} of {this.props.searchResults.searchFormattedResults.length}
                    </span>
                    <div style={{float: "right", verticalAlign: "top"}}>
                        <Button icon="profile"
                                style={{marginRight: "8px"}}
                                onClick={() => this.setState({tracksModalVisible: true})}>
                            Visualize Tracks</Button>
                        <Button icon="bar-chart"
                                style={{marginRight: "8px"}}
                                onClick={() => this.setState({summaryModalVisible: true})}>View Summary</Button>
                        <Button icon="export">Export as CSV</Button>
                    </div>
                </Typography.Title>
                <SearchSummaryModal searchResults={this.props.searchResults}
                                    visible={this.state.summaryModalVisible}
                                    onCancel={() => this.setState({summaryModalVisible: false})} />
                <SearchTracksModal searchResults={this.props.searchResults}
                                   visible={this.state.tracksModalVisible}
                                   onCancel={() => this.setState({tracksModalVisible: false})} />
                <Table bordered
                       size="middle"
                       columns={SEARCH_RESULT_COLUMNS}
                       dataSource={this.props.searchResults.searchFormattedResults || []}
                       pagination={{pageSize: this.state.pageSize}}
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
            </> : null}
        </>;
    }
}

ExplorerDatasetSearch.propTypes = {
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    fetchingSearch: PropTypes.bool,
    searchResults: PropTypes.object,
    selectedRows: PropTypes.arrayOf(PropTypes.string),

    addDataTypeQueryForm: PropTypes.func.isRequired,
    updateDataTypeQueryForm: PropTypes.func.isRequired,
    removeDataTypeQueryForm: PropTypes.func.isRequired,
    performSearchIfPossible: PropTypes.func.isRequired,
    setSelectedRows: PropTypes.func.isRequired,

    federationServiceInfo: serviceInfoPropTypesShape,
    datasetsByID: PropTypes.objectOf(datasetPropTypesShape),
};

const mapStateToProps = (state, ownProps) => {
    const datasetID = ownProps.match.params.dataset;
    return {
        dataTypeForms: state.explorer.dataTypeFormsByDatasetID[datasetID] || [],
        fetchingSearch: state.explorer.fetchingSearchByDatasetID[datasetID] || false,
        searchResults: state.explorer.searchResultsByDatasetID[datasetID] || null,
        selectedRows: state.explorer.selectedRowsByDatasetID[datasetID] || [],

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
}).map(([k, v]) => [k, (...args) => dispatch(v(ownProps.match.params.dataset, ...args))]));

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExplorerDatasetSearch));
