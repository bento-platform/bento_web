import React, {useCallback, useMemo, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Col, Dropdown, Icon, Menu, Row, Table, Typography } from "antd";

import { useStartIngestionFlow } from "../manager/workflowCommon";
import { datasetPropTypesShape, projectPropTypesShape, workflowsStateToPropsMixin } from "../../propTypes";
import { clearDatasetDataType } from "../../modules/metadata/actions";
import { fetchDatasetDataTypesSummariesIfPossible } from "../../modules/datasets/actions";
import genericConfirm from "../ConfirmationModal";
import DataTypeSummaryModal from "./datatype/DataTypeSummaryModal";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetDataTypes = React.memo(({isPrivate, project, dataset}) => {
    const dispatch = useDispatch();
    const datasetDataTypes = useSelector((state) => Object.values(
        state.datasetDataTypes.itemsByID[dataset.identifier]?.itemsByID ?? {}));
    const datasetSummaries = useSelector((state) => state.datasetSummaries.itemsByID[dataset.identifier]);
    const isFetchingDataset = useSelector(
        (state) => state.datasetDataTypes.itemsByID[dataset.identifier]?.isFetching);

    const ingestionWorkflows = useSelector(state => workflowsStateToPropsMixin(state).workflows.ingestion);

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

                    const ingestMenu = (
                        <Menu onClick={(i) => startIngestionFlow(dtIngestionWorkflowsByID[i.key], {
                            // TODO: this requires that exactly this input is present, and may break in the future
                            //  in a bit of a non-obvious way.
                            "project_dataset": `${project.identifier}:${dataset.identifier}`,
                        })}>
                            {dtIngestionWorkflows.map((wf) => (<Menu.Item key={wf.id}>{wf.name}</Menu.Item>))}
                        </Menu>
                    );

                    const ingestDropdown = (
                        <Dropdown overlay={ingestMenu} trigger={["click"]}>
                            <Button icon="import" style={{ width: "100%" }} disabled={!dtIngestionWorkflows.length}>
                                Ingest <Icon type="down" />
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
                                    type="danger"
                                    icon="delete"
                                    disabled={ !dt.count || dt.count && dt.count === 0}
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
                visible={datatypeSummaryVisible}
                onCancel={onDataTypeSummaryModalCancel}
            />

            <Typography.Title level={4}>
                Data Types
            </Typography.Title>

            <Table
                bordered
                size="middle"
                pagination={false}
                dataSource={datasetDataTypes}
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
