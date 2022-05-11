import React, { useState } from "react";
import PropTypes from "prop-types";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { Button, Col, Row, Table, Typography } from "antd";

import TableAdditionModal from "./table/TableAdditionModal";
import TableDeletionModal from "./table/TableDeletionModal";

import {
    addProjectTable,
    deleteProjectTableIfPossible,
    fetchProjectsWithDatasetsAndTables,
} from "../../modules/metadata/actions";
import { nop } from "../../utils/misc";
import { fetchTableSummaryIfPossible } from "../../modules/tables/actions";
import TableSummaryModal from "./table/TableSummaryModal";
import {
    datasetPropTypesShape,
    projectPropTypesShape,
    serviceInfoPropTypesShape,
} from "../../propTypes";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetTables = ({
    isPrivate,
    project,
    dataset,
    onTableIngest,
    isFetchingTables,
    chordServicesByArtifact,
    serviceInfoByArtifact,
    addProjectTable,
    deleteProjectTable,
    fetchProjectsWithDatasetsAndTables,
    fetchTableSummaryIfPossible,
}) => {
    const [additionModalVisible, setAdditionModalVisible] = useState(false);
    const [deletionModalVisible, setDeletionModalVisible] = useState(false);
    const [tableSummaryModalVisible, setTableSummaryModalVisible] =
        useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    const handleAdditionClick = () => {
        setAdditionModalVisible(true);
    };

    const handleAdditionCancel = () => {
        setAdditionModalVisible(false);
    };

    const handleAdditionSubmit = async (values) => {
        const [serviceArtifact, dataTypeID] = values.dataType.split(":");
        const serviceInfo = serviceInfoByArtifact[serviceArtifact];
        await addProjectTable(
            dataset.identifier,
            serviceInfo,
            dataTypeID,
            values.name
        );

        await fetchProjectsWithDatasetsAndTables(); // TODO: If needed / only this project...

        setAdditionModalVisible(false);
    };

    const handleTableDeletionClick = (t) => {
        setDeletionModalVisible(true);
        setSelectedTable(t);
    };

    const handleTableDeletionCancel = () => {
        setDeletionModalVisible(false);
    };

    const handleTableDeletionSubmit = async () => {
        if (selectedTable === null) return;
        await deleteProjectTable(selectedTable);

        await fetchProjectsWithDatasetsAndTables(); // TODO: If needed / only this project...

        setDeletionModalVisible(false);
    };

    const showTableSummaryModal = (table) => {
        fetchTableSummaryIfPossible(
            chordServicesByArtifact[table.service_artifact],
            serviceInfoByArtifact[table.service_artifact],
            table.table_id
        ); // TODO
        setTableSummaryModalVisible(true);
        setSelectedTable(table);
    };

    const tableListColumns = [
        {
            title: "ID",
            dataIndex: "table_id",
            render: (tableID, t) =>
                isPrivate ? (
                    <a
                        style={{ fontFamily: "monospace" }}
                        onClick={() => showTableSummaryModal(t)}
                    >
                        {tableID}
                    </a>
                ) : (
                    <span style={{ fontFamily: "monospace" }}>tableID</span>
                ),
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (n) => (n ? n : NA_TEXT),
            defaultSortOrder: "ascend",
            sorter: (a, b) =>
                a.name && b.name
                    ? a.name.localeCompare(b.name)
                    : a.table_id.localeCompare(b.table_id),
        },
        { title: "Data Type", dataIndex: "data_type" },
        ...(isPrivate
            ? [
                {
                    title: "Actions",
                    key: "actions",
                    width: 230 /*330,*/,
                    render: (t) => (
                          <Row gutter={10}>
                              <Col span={12}>
                                  <Button
                                      icon="import"
                                      style={{ width: "100%" }}
                                      onClick={() =>
                                          (onTableIngest || nop)(project, t)
                                      }
                                  >
                                      Ingest
                                  </Button>
                              </Col>
                              {/* TODO: Edit Table Name: v0.2 */}
                              {/*<Col span={8}><Button icon="edit" style={{width: "100%"}}>Edit</Button></Col>*/}
                              {t.manageable !== false ? (
                                  <Col span={12}>
                                      <Button
                                          type="danger"
                                          icon="delete"
                                          onClick={() =>
                                              handleTableDeletionClick(t)
                                          }
                                          style={{ width: "100%" }}
                                      >
                                          Delete
                                      </Button>
                                  </Col>
                              ) : null}
                          </Row>
                    ),
                },
            ]
            : []),
    ];

    dataset = dataset || {};
    const tables = (dataset.tables || []).map((t) => ({
        ...t,
        name: t.name || null,
    }));
    return (
        <>
            <Typography.Title level={4}>
                Tables
                {isPrivate ? (
                    <div style={{ float: "right" }}>
                        {/* TODO: Implement v0.2
                            {(strayTables || []).length > 0 ? (
                                <Button icon="import" style={{verticalAlign: "top", marginRight: "10px"}}>
                                    Adopt Stray Tables ({strayTables.length})
                                </Button>
                            ) : null} */}
                        <Button
                            icon="plus"
                            style={{ verticalAlign: "top" }}
                            type="primary"
                            onClick={() => handleAdditionClick()}
                        >
                            Add Table
                        </Button>
                    </div>
                ) : null}
            </Typography.Title>

            <Table
                bordered
                dataSource={tables}
                rowKey="table_id"
                // expandedRowRender={() => (<span>TODO: List of files</span>)} TODO: Implement v0.2
                columns={tableListColumns}
                loading={isFetchingTables}
            />

            <TableSummaryModal
                visible={tableSummaryModalVisible}
                table={selectedTable}
                onCancel={() => setTableSummaryModalVisible(false)}
            />

            <TableAdditionModal
                visible={additionModalVisible}
                project={project}
                dataset={dataset}
                onSubmit={(vs) => handleAdditionSubmit(vs)}
                onCancel={() => handleAdditionCancel()}
            />

            <TableDeletionModal
                visible={deletionModalVisible}
                table={dataset}
                onSubmit={() => handleTableDeletionSubmit()}
                onCancel={() => handleTableDeletionCancel()}
            />
        </>
    );
};

DatasetTables.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
    onTableIngest: PropTypes.func,
    isFetchingTables: PropTypes.bool,

    chordServicesByArtifact: PropTypes.objectOf(
        PropTypes.shape({
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
        })
    ),
    serviceInfoByArtifact: PropTypes.objectOf(serviceInfoPropTypesShape),

    addProjectTable: PropTypes.func,
    deleteProjectTable: PropTypes.func,
    fetchProjectsWithDatasetsAndTables: PropTypes.func,
    fetchTableSummaryIfPossible: PropTypes.func,
};

const mapStateToProps = (state) => ({
    chordServicesByArtifact: state.chordServices.itemsByArtifact,
    serviceInfoByArtifact: state.services.itemsByArtifact,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addProjectTable: (ds, s, dt, name) =>
        dispatch(addProjectTable(ownProps.project, ds, s, dt, name)),
    deleteProjectTable: (table) =>
        dispatch(deleteProjectTableIfPossible(ownProps.project, table)),
    ...bindActionCreators(
        {
            fetchProjectsWithDatasetsAndTables,
            fetchTableSummaryIfPossible,
        },
        dispatch
    ),
});

export default connect(mapStateToProps, mapDispatchToProps)(DatasetTables);
