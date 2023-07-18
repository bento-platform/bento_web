import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, Table, Typography } from "antd";

import PropTypes from "prop-types";
import { datasetPropTypesShape, projectPropTypesShape } from "../../propTypes";
import { deleteDatasetDataType } from "../../modules/metadata/actions";
import { fetchDatasetSummaryIfPossible } from "../../modules/datasets/actions";
import confirmDataTypeDelete from "./DatatypeDeletionModal";
import { nop } from "../../utils/misc";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetDataTypes = ({ isPrivate, project, dataset, onIngest, isFetchingDatasets }) => {

    const dispatch = useDispatch();
    const datasetDataTypes = useSelector((state) => state.datasetSummaries.datasetDatatypesSummaries);

    dataset = dataset || {};
    const handleDeleteDataType = async (dataType) => {
        confirmDataTypeDelete(
            dataType,
            async () => {
                await dispatch(deleteDatasetDataType(dataset.identifier, dataType.id));
                await dispatch(fetchDatasetSummaryIfPossible(dataset.identifier));
            },
        );
    };

    useEffect(() => {
        (async () => {
            await dispatch(fetchDatasetSummaryIfPossible(dataset.identifier));
        })();
    }, []);

    const dataTypesColumns = [
        {
            title: "Name",
            dataIndex: "label",
            // TODO: click to see dataType summary charts
            render: (n) => (n ?? NA_TEXT),
            defaultSortOrder: "ascend",
            sorter: (a, b) => a.label.localeCompare(b.label),
        },
        {
            title: "Count",
            dataIndex: "count",
            render: (c) => (c ?? NA_TEXT),
        },
        ...(isPrivate ? [
            {
                title: "Actions",
                key: "actions",
                width: 230,
                render: (t) => (
                    <Row gutter={10}>
                        <Col span={12}>
                            <Button
                                icon="import"
                                style={{ width: "100%" }}
                                onClick={() => (onIngest || nop)(project, t)}
                            >
                                Ingest
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                type="danger"
                                icon="delete"
                                onClick={() => handleDeleteDataType(t)}
                                style={{ width: "100%" }}
                            >
                                Delete
                            </Button>
                        </Col>
                    </Row>
                ),
            },
        ] : null),
    ];

    return (
        <>
            <Typography.Title level={4}>
                Data Types
            </Typography.Title>

            <Table
                bordered
                dataSource={datasetDataTypes}
                rowKey="id"
                columns={dataTypesColumns}
                loading={isFetchingDatasets}
            />
        </>
    );
};

DatasetDataTypes.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
    onIngest: PropTypes.func,
    isFetchingDatasets: PropTypes.bool,
};

export default DatasetDataTypes;
