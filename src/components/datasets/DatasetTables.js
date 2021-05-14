import React, {Component} from "react";
import PropTypes from "prop-types";

import {bindActionCreators} from "redux";
import {connect} from "react-redux";

import {Button, Col, Row, Table, Typography} from "antd";

import TableAdditionModal from "./table/TableAdditionModal";
import TableDeletionModal from "./table/TableDeletionModal";

import {
    addProjectTable,
    deleteProjectTableIfPossible,
    fetchProjectsWithDatasetsAndTables
} from "../../modules/metadata/actions";
import {nop} from "../../utils/misc";
import {fetchTableSummaryIfPossible} from "../../modules/tables/actions";
import TableSummaryModal from "./table/TableSummaryModal";
import {datasetPropTypesShape, projectPropTypesShape, serviceInfoPropTypesShape} from "../../propTypes";


const NA_TEXT = (<span style={{color: "#999", fontStyle: "italic"}}>N/A</span>);

class DatasetTables extends Component {
    constructor(props) {
        super(props);

        this.state = {
            additionModalVisible: false,
            deletionModalVisible: false,
            tableSummaryModalVisible: false,
            selectedTable: null,
        };

        this.handleAdditionClick = this.handleAdditionClick.bind(this);
        this.handleAdditionCancel = this.handleAdditionCancel.bind(this);
        this.handleAdditionSubmit = this.handleAdditionSubmit.bind(this);

        this.handleTableDeletionClick = this.handleTableDeletionClick.bind(this);
        this.handleTableDeletionCancel = this.handleTableDeletionCancel.bind(this);
        this.handleTableDeletionSubmit = this.handleTableDeletionSubmit.bind(this);

        this.showTableSummaryModal = this.showTableSummaryModal.bind(this);
    }

    handleAdditionClick() {
        this.setState({additionModalVisible: true});
    }

    handleAdditionCancel() {
        this.setState({additionModalVisible: false});
    }

    async handleAdditionSubmit(values) {
        const [serviceArtifact, dataTypeID] = values.dataType.split(":");
        const serviceInfo = this.props.serviceInfoByArtifact[serviceArtifact];
        await this.props.addProjectTable(this.props.dataset.identifier, serviceInfo, dataTypeID, values.name);

        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

        this.setState({additionModalVisible: false});
    }

    handleTableDeletionClick(t) {
        this.setState({deletionModalVisible: true, selectedTable: t});
    }

    handleTableDeletionCancel() {
        this.setState({deletionModalVisible: false});
    }

    async handleTableDeletionSubmit() {
        if (this.state.selectedTable === null) return;
        await this.props.deleteProjectTable(this.state.selectedTable);

        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

        this.setState({deletionModalVisible: false});
    }

    showTableSummaryModal(table) {
        this.props.fetchTableSummaryIfPossible(this.props.chordServicesByArtifact[table.service_artifact],
            this.props.serviceInfoByArtifact[table.service_artifact], table.table_id);  // TODO
        this.setState({tableSummaryModalVisible: true, selectedTable: table});
    }

    render() {
        const tableListColumns = [
            {
                title: "ID",
                dataIndex: "table_id",
                render: (tableID, t) => this.props.isPrivate
                    ? <a style={{fontFamily: "monospace"}} onClick={() => this.showTableSummaryModal(t)}>{tableID}</a>
                    : <span style={{fontFamily: "monospace"}}>tableID</span>,
            },
            {
                title: "Name",
                dataIndex: "name",
                render: n => (n ? n : NA_TEXT),
                defaultSortOrder: "ascend",
                sorter: (a, b) => (a.name && b.name)
                    ? a.name.localeCompare(b.name)
                    : a.table_id.localeCompare(b.table_id)
            },
            {title: "Data Type", dataIndex: "data_type"},
            ...(this.props.isPrivate ? [
                {
                    title: "Actions",
                    key: "actions",
                    width: 230, /*330,*/
                    render: t => (
                        <Row gutter={10}>
                            <Col span={12}>
                                <Button icon="import"
                                        style={{width: "100%"}}
                                        onClick={() => (this.props.onTableIngest || nop)(this.props.project, t)}>
                                    Ingest
                                </Button>
                            </Col>
                            {/* TODO: Edit Table Name: v0.2 */}
                            {/*<Col span={8}><Button icon="edit" style={{width: "100%"}}>Edit</Button></Col>*/}
                            {t.manageable !== false ? (
                                <Col span={12}><Button type="danger"
                                                       icon="delete"
                                                       onClick={() => this.handleTableDeletionClick(t)}
                                                       style={{width: "100%"}}>Delete</Button></Col>
                            ) : null}
                        </Row>
                    )
                }
            ] : [])
        ];

        const dataset = this.props.dataset || {};
        const tables = (dataset.tables || []).map(t => ({...t, name: t.name || null}));
        return <>
            <Typography.Title level={4}>
                Tables
                {this.props.isPrivate ? (
                    <div style={{float: "right"}}>
                        {/* TODO: Implement v0.2
                            {(this.props.strayTables || []).length > 0 ? (
                                <Button icon="import" style={{verticalAlign: "top", marginRight: "10px"}}>
                                    Adopt Stray Tables ({this.props.strayTables.length})
                                </Button>
                            ) : null} */}
                        <Button icon="plus"
                                style={{verticalAlign: "top"}}
                                type="primary"
                                onClick={() => this.handleAdditionClick()}>
                            Add Table
                        </Button>
                    </div>
                ) : null}
            </Typography.Title>

            <Table bordered
                   dataSource={tables}
                   rowKey="table_id"
                   // expandedRowRender={() => (<span>TODO: List of files</span>)} TODO: Implement v0.2
                   columns={tableListColumns}
                   loading={this.props.isFetchingTables} />

            <TableSummaryModal visible={this.state.tableSummaryModalVisible}
                               table={this.state.selectedTable}
                               onCancel={() => this.setState({tableSummaryModalVisible: false})} />

            <TableAdditionModal visible={this.state.additionModalVisible}
                                project={this.props.project}
                                dataset={dataset}
                                onSubmit={vs => this.handleAdditionSubmit(vs)}
                                onCancel={() => this.handleAdditionCancel()} />

            <TableDeletionModal visible={this.state.deletionModalVisible}
                                table={dataset}
                                onSubmit={() => this.handleTableDeletionSubmit()}
                                onCancel={() => this.handleTableDeletionCancel()} />
        </>;
    }
}

DatasetTables.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
    onTableIngest: PropTypes.func,
    isFetchingTables: PropTypes.bool,

    chordServicesByArtifact: PropTypes.objectOf(PropTypes.shape({
        apt_dependencies: PropTypes.arrayOf(PropTypes.string),
        data_service: PropTypes.bool,
        manageable_tables: PropTypes.string,
        python_callable: PropTypes.string,
        python_module: PropTypes.string,
        repository: PropTypes.string,
        run_environment: PropTypes.objectOf(PropTypes.string),
        service_runnable: PropTypes.string,
        type: PropTypes.shape({
            artifact: PropTypes.string.isRequired,
            language: PropTypes.string,
            organization: PropTypes.string,
        }),
        wsgi: PropTypes.bool,

        post_stop_commands: PropTypes.arrayOf(PropTypes.string),
        post_start_commands: PropTypes.arrayOf(PropTypes.string),
        pre_install_commands: PropTypes.arrayOf(PropTypes.string),
        pre_start_commands: PropTypes.arrayOf(PropTypes.string),
    })),
    serviceInfoByArtifact: PropTypes.objectOf(serviceInfoPropTypesShape),

    addProjectTable: PropTypes.func,
    deleteProjectTable: PropTypes.func,
    fetchProjectsWithDatasetsAndTables: PropTypes.func,
    fetchTableSummaryIfPossible: PropTypes.func,
};

const mapStateToProps = state => ({
    chordServicesByArtifact: state.chordServices.itemsByArtifact,
    serviceInfoByArtifact: state.services.itemsByArtifact,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addProjectTable: (ds, s, dt, name) => dispatch(addProjectTable(ownProps.project, ds, s, dt, name)),
    deleteProjectTable: table => dispatch(deleteProjectTableIfPossible(ownProps.project, table)),
    ...bindActionCreators({
        fetchProjectsWithDatasetsAndTables,
        fetchTableSummaryIfPossible,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DatasetTables);
