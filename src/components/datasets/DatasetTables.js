import React, {useMemo, useState} from "react";
import PropTypes from "prop-types";

import { useSelector, useDispatch } from "react-redux";

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
import { datasetPropTypesShape, projectPropTypesShape } from "../../propTypes";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetTables = ({ isPrivate, project, dataset, onTableIngest, isFetchingTables }) => {
    const dispatch = useDispatch();

    const chordServicesByArtifact = useSelector((state) => state.chordServices.itemsByArtifact);
    const serviceInfoByArtifact = useSelector((state) => state.services.itemsByArtifact);

    const dataTypesByArtifact = useSelector(state => state.serviceDataTypes.dataTypesByServiceArtifact);
    const dataTypesByID = useMemo(
        () => Object.fromEntries(
            Object.values(dataTypesByArtifact ?? {})
                .flatMap(v => (v?.items ?? []))
                .map(dt => [dt.id, dt])),
        [dataTypesByArtifact]);

    const [additionModalVisible, setAdditionModalVisible] = useState(false);
    const [deletionModalVisible, setDeletionModalVisible] = useState(false);
    const [tableSummaryModalVisible, setTableSummaryModalVisible] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    const handleAdditionSubmit = async (values) => {
        const [serviceArtifact, dataTypeID] = values.dataType.split(":");
        const serviceInfo = serviceInfoByArtifact[serviceArtifact];
        await dispatch(addProjectTable(project, dataset.identifier, serviceInfo, dataTypeID, values.name));

        await dispatch(fetchProjectsWithDatasetsAndTables()); // TODO: If needed / only this project...

        setAdditionModalVisible(false);
    };

    const handleTableDeletionClick = (t) => {
        setDeletionModalVisible(true);
        setSelectedTable(t);
    };

    const handleTableDeletionSubmit = async () => {
        if (selectedTable === null) return;
        await dispatch(deleteProjectTableIfPossible(project, selectedTable));
        await dispatch(fetchProjectsWithDatasetsAndTables()); // TODO: If needed / only this project...

        setDeletionModalVisible(false);
    };

    const showTableSummaryModal = (table) => {
        dispatch(fetchTableSummaryIfPossible(serviceInfoByArtifact[table.service_artifact], table.table_id));
        setTableSummaryModalVisible(true);
        setSelectedTable(table);
    };

    const tableListColumns = [
        {
            title: "ID",
            dataIndex: "table_id",
            render: (tableID, t) =>
                isPrivate ? (
                    <a style={{ fontFamily: "monospace" }} onClick={() => showTableSummaryModal(t)}>
                        {tableID}
                    </a>
                ) : (
                    <span style={{ fontFamily: "monospace" }}>{tableID}</span>
                ),
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (n) => (n ? n : NA_TEXT),
            defaultSortOrder: "ascend",
            sorter: (a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : a.table_id.localeCompare(b.table_id)),
        },
        {
            title: "Data Type",
            dataIndex: "data_type",
            render: dtID => dataTypesByID[dtID]?.label ?? dtID,
        },
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
                                      onClick={() => (onTableIngest || nop)(project, t)}
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
                                          onClick={() => handleTableDeletionClick(t)}
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
                            onClick={() => setAdditionModalVisible(true)}
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
                onSubmit={handleAdditionSubmit}
                onCancel={() => setAdditionModalVisible(false)}
            />

            <TableDeletionModal
                visible={deletionModalVisible}
                table={dataset}
                onSubmit={handleTableDeletionSubmit}
                onCancel={() => setDeletionModalVisible(false)}
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
};

export default DatasetTables;
