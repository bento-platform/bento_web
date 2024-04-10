import React, {useCallback, useMemo, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Col, Dropdown, Row, Table, Typography } from "antd";
import { DeleteOutlined, DownOutlined, ImportOutlined } from "@ant-design/icons";

import { useWorkflows } from "@/hooks";
import { datasetPropTypesShape, projectPropTypesShape } from "@/propTypes";
import { clearDatasetDataType } from "@/modules/metadata/actions";
import { fetchDatasetDataTypesSummariesIfPossible } from "@/modules/datasets/actions";
import { useStartIngestionFlow } from "../manager/workflowCommon";

import genericConfirm from "../ConfirmationModal";
import DataTypeSummaryModal from "./datatype/DataTypeSummaryModal";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetDataTypes = React.memo(({ isPrivate, project, dataset }) => {
    const dispatch = useDispatch();
    const datasetDataTypes = useSelector((state) => state.datasetDataTypes.itemsByID[dataset.identifier]);
    const datasetDataTypeValues = useMemo(() => Object.values(datasetDataTypes?.itemsByID ?? {}), [datasetDataTypes]);
    const datasetSummaries = useSelector((state) => state.datasetSummaries.itemsByID[dataset.identifier]);

    const isFetchingDataset = datasetDataTypes?.isFetching ?? false;

    const { workflowsByType } = useWorkflows();
    const ingestionWorkflows = workflowsByType.ingestion.items;

    const [datatypeSummaryVisible, setDatatypeSummaryVisible] = useState(false);
    const [selectedDataType, setSelectedDataType] = useState(null);

    const selectedSummary = datasetSummaries?.data?.[selectedDataType?.id] ?? {};

    const handleClearDataType = useCallback((dataType) => {
        genericConfirm({
            title: `Are you sure you want to delete the "${dataType.label || dataType.id}" data type?`,
            content: "Deleting this means all instances of this data type contained in the dataset " +
            "will be deleted permanently, and will no longer be available for exploration.",
            onOk: async () => {
                await dispatch(clearDatasetDataType(dataset.identifier, dataType.id));
                await dispatch(fetchDatasetDataTypesSummariesIfPossible(dataset.identifier));
            },
        });
    }, [dispatch, dataset]);

    const showDataTypeSummary = useCallback((dataType) => {
        setSelectedDataType(dataType);
        setDatatypeSummaryVisible(true);
    }, []);

    const startIngestionFlow = useStartIngestionFlow();

    const dataTypesColumns = useMemo(() => [
        {
            title: "Name",
            key: "label",
            render: (dt) =>
                isPrivate ? (
                <a onClick={() => showDataTypeSummary(dt)}>
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
                width: 240,
                render: (dt) => {
                    const dtIngestionWorkflows = ingestionWorkflows
                        .filter((wf) => wf.data_type === dt.id || (wf.tags ?? []).includes(dt.id));
                    const dtIngestionWorkflowsByID = Object.fromEntries(
                        dtIngestionWorkflows.map((wf) => [wf.id, wf]));

                    const ingestMenu = {
                        onClick: (i) => startIngestionFlow(dtIngestionWorkflowsByID[i.key], {
                            // TODO: this requires that exactly this input is present, and may break in the future
                            //  in a bit of a non-obvious way.
                            "project_dataset": `${project.identifier}:${dataset.identifier}`,
                        }),
                        items: dtIngestionWorkflows.map((wf) => ({ key: wf.id, label: wf.name })),
                    };

                    const ingestDropdown = (
                        <Dropdown menu={ingestMenu} trigger={["click"]}>
                            <Button icon={<ImportOutlined />}
                                    style={{ width: "100%" }}
                                    disabled={!dtIngestionWorkflows.length}>
                                Ingest <DownOutlined />
                            </Button>
                        </Dropdown>
                    );

                    return (
                        <Row gutter={10}>
                            <Col span={13}>
                                {ingestDropdown}
                            </Col>
                            <Col span={11}>
                                <Button
                                    danger={true}
                                    icon={<DeleteOutlined />}
                                    disabled={!dt.count}
                                    onClick={() => handleClearDataType(dt)}
                                    style={{ width: "100%" }}
                                >
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    );
                },
            },
        ] : null),
    ], [isPrivate, project, dataset, ingestionWorkflows, startIngestionFlow]);

    const onDataTypeSummaryModalCancel = useCallback(() => setDatatypeSummaryVisible(false), []);

    return (
        <>
            <DataTypeSummaryModal
                dataType={selectedDataType}
                summary={selectedSummary}
                open={datatypeSummaryVisible}
                onCancel={onDataTypeSummaryModalCancel}
            />

            <Typography.Title level={4} style={{ marginTop: 0 }}>
                Data Types
            </Typography.Title>

            <Table
                bordered
                size="middle"
                pagination={false}
                dataSource={datasetDataTypeValues}
                rowKey="id"
                columns={dataTypesColumns}
                loading={isFetchingDataset}
            />
        </>
    );
});

DatasetDataTypes.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
};

export default DatasetDataTypes;
