import React, {useEffect, useMemo, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, Table, Typography } from "antd";

import PropTypes from "prop-types";
import { datasetPropTypesShape, projectPropTypesShape } from "../../propTypes";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetDataTypes = ({isPrivate, project, dataset, onIngest, isFetchingDatasets}) => {
    const dispatch = useDispatch();

    const serviceInfoByKind = useSelector((state) => state.services.itemsByKind);
    const dataTypesByKind = useSelector(state => state.serviceDataTypes.dataTypesByServiceKind);
    const dataTypesByID = useMemo(
        () => Object.fromEntries(
            Object.values(dataTypesByKind ?? {})
                .flatMap(v => (v?.items ?? []))
                .map(dt => [dt.id, dt])),
        [dataTypesByKind]);
    
    dataset = dataset || {};

    const handleDeleteDataType = async () => {
        console.debug("TODO: delete data type on click.")
    }
    
    useEffect(() => {
        console.debug({
            dataset,
            dataTypesByID,
            dataTypesByKind
        });
    }, [])

    const dataTypesColumns = [
        {
            title: "Name",
            dataIndex: "name",
            // TODO: click to see dataType summary charts
            render: (n) => (n ?? NA_TEXT),
            defaultSortOrder: "ascend",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Count",
            dataIndex: "count",
            render: (c) => (c ?? NA_TEXT)
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
                                style={{width: "100%"}}
                                onClick={() => (onIngest || nop)(project, dt)}
                            >
                                Ingest
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                type="danger"
                                icon="delete"
                                onClick={() => handleDeleteDataType()}
                                style={{ width: "100%" }}
                            >
                                Delete
                            </Button>
                        </Col>
                    </Row>
                )
            }
        ] : null)
    ];
    
    const dataTypes = Object.values(dataTypesByID).map(dt => {
        return {
            ...dt,
            name: dt.label
        }
    });

    return (
        <>
            <Typography.Title level={4}>
                Data Types
            </Typography.Title>

            <Table
                bordered
                dataSource={dataTypes}
                rowKey="date_type"
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
