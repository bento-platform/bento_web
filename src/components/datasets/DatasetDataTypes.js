import React, {useCallback, useMemo, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, Table, Typography } from "antd";

import PropTypes from "prop-types";
import { datasetPropTypesShape, projectPropTypesShape } from "../../propTypes";
import { clearDatasetDataType } from "../../modules/metadata/actions";
import { fetchDatasetDataTypesSummaryIfPossible } from "../../modules/datasets/actions";
import genericConfirm from "../ConfirmationModal";
import DataTypeSummaryModal from "./datatype/DataTypeSummaryModal";
import { nop } from "../../utils/misc";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetDataTypes = React.memo(
    ({isPrivate, project, dataset, onDatasetIngest, isFetchingDatasets }) => {
        const dispatch = useDispatch();

        const datasetDataTypes = useSelector((state) => state.datasetDataTypes.itemsById[dataset.identifier]);
        const datasetSummaries = useSelector((state) => state.datasetSummaries.itemsById[dataset.identifier]);

        const [datatypeSummaryVisible, setDatatypeSummaryVisible] = useState(false);
        const [selectedDataType, setSelectedDataType] = useState(null);

        const selectedSummary = (selectedDataType !== null && datasetSummaries)
            ? datasetSummaries[selectedDataType.id]
            : {};

        const handleClearDataType = useCallback((dataType) => {
            genericConfirm({
                title: `Are you sure you want to delete the "${dataType.label || dataType.id}" data type?`,
                content: "Deleting this means all instances of this data type contained in the dataset " +
                "will be deleted permanently, and will no longer be available for exploration.",
                onOk: async () => {
                    await dispatch(clearDatasetDataType(dataset.identifier, dataType.id));
                    await dispatch(fetchDatasetDataTypesSummaryIfPossible(dataset.identifier));
                },
            });
        }, [dispatch, dataset]);

        const showDatatypeSummary = useCallback((dataType) => {
            setSelectedDataType(dataType);
            setDatatypeSummaryVisible(true);
        }, []);

        const dataTypesColumns = useMemo(() => [
            {
                title: "Name",
                key: "label",
                render: (dt) =>
                    isPrivate ? (
                    <a onClick={() => showDatatypeSummary(dt)}>
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
                                onClick={() => (onDatasetIngest || nop)(project, dataset, dt)}
                            >
                                Ingest
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                type="danger"
                                icon="delete"
                                disabled={dt.count !== null && dt.count > 0}
                                onClick={() => handleClearDataType(dt)}
                                style={{ width: "100%" }}
                            >
                                Clear Data
                            </Button>
                        </Col>
                    </Row>
                    ),
                },
            ] : null),
        ], [isPrivate, project, dataset, onDatasetIngest]);

        const onDataTypeSummaryModalCancel = useCallback(() => setDatatypeSummaryVisible(false), []);

        return (
            <>
            <DataTypeSummaryModal
                dataType={selectedDataType}
                summary={selectedSummary}
                visible={datatypeSummaryVisible}
                onCancel={onDataTypeSummaryModalCancel}
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
    });

DatasetDataTypes.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
    onDatasetIngest: PropTypes.func,
    isFetchingDatasets: PropTypes.bool,
};

export default DatasetDataTypes;
