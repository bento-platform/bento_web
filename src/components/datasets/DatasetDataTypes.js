import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, Table, Typography } from "antd";

import PropTypes from "prop-types";
import { datasetPropTypesShape, projectPropTypesShape } from "../../propTypes";
import { deleteDatasetDataType } from "../../modules/metadata/actions";
import { fetchDatasetDataTypesSummaryIfPossible, fetchDatsetSummaryIfPossible } from "../../modules/datasets/actions";
import genericConfirm from "../ConfirmationModal";
import { nop } from "../../utils/misc";
import DataTypeSummaryModal from "./datatype/DataTypeSummaryModal";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetDataTypes = ({ isPrivate, project, dataset, onIngest, isFetchingDatasets }) => {
    dataset = dataset || {};

    const dispatch = useDispatch();

    const datasetDataTypes = useSelector((state) => state.datasetDataTypes.datasetDatatypesSummaries);
    const datasetSummaries = useSelector((state) => state.datasetSummaries.items);

    const [datatypeSummaryVisible, setDatatypeSummaryVisible] = useState(false);
    const [selectedDataType, setSelectedDataType] = useState(null);

    const selectedSummary = useMemo(() => {
        return (selectedDataType !== null && datasetSummaries)
            ? datasetSummaries[selectedDataType.id]
            : {};
    }, [selectedDataType, datasetSummaries]);

    const handleDeleteDataType = async (dataType) => {
        genericConfirm({
            title: `Are you sure you want to delete the "${dataType.label || ""}" data type?`,
            content: "Deleting this means all instances of this data type contained in the dataset " +
                "will be deleted permanently, and will no longer be available for exploration.",
            onOk: async () => {
                await dispatch(deleteDatasetDataType(dataset.identifier, dataType.id));
                await dispatch(fetchDatasetDataTypesSummaryIfPossible(dataset.identifier));
            },
        });
    };

    const showDatatypeSummary = (dataType) => {
        setSelectedDataType(dataType);
        setDatatypeSummaryVisible(true);
    };

    useEffect(() => {
        (async () => {
            await dispatch(fetchDatasetDataTypesSummaryIfPossible(dataset.identifier));
            await dispatch(fetchDatsetSummaryIfPossible(dataset.identifier));
        })();
    }, []);

    const dataTypesColumns = [
        {
            title: "Name",
            key: "label",
            render: (dt) =>
                isPrivate ? (
                    <a style={{ fontFamily: "monospace" }} onClick={() => showDatatypeSummary(dt)}>
                        {dt.label ?? NA_TEXT}
                    </a>
                ) : dt.label ?? NA_TEXT,
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
                render: (dt) => (
                    <Row gutter={10}>
                        <Col span={12}>
                            <Button
                                icon="import"
                                style={{ width: "100%" }}
                                onClick={() => (onIngest || nop)(project, dt)}
                            >
                                Ingest
                            </Button>
                        </Col>
                        {dt.queryable !== false ? <Col span={12}>
                            <Button
                                type="danger"
                                icon="delete"
                                onClick={() => handleDeleteDataType(dt)}
                                style={{ width: "100%" }}
                            >
                                Delete
                            </Button>
                        </Col> : null}
                    </Row>
                ),
            },
        ] : null),
    ];

    return (
        <>
            <DataTypeSummaryModal
                dataType={selectedDataType}
                summary={selectedSummary}
                visible={datatypeSummaryVisible}
                onCancel={() => setDatatypeSummaryVisible(false)}
            />

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
