import React, {useEffect, useMemo, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, Table, Typography } from "antd";

import PropTypes from "prop-types";
import { datasetPropTypesShape, projectPropTypesShape } from "../../propTypes";
import { deleteDatasetDataType } from "../../modules/metadata/actions";
import { useAuthorizationHeader } from "../../lib/auth/utils";

const NA_TEXT = <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>;

const DatasetDataTypes = ({isPrivate, project, dataset, onIngest, isFetchingDatasets}) => {
    const dispatch = useDispatch();

    const katsuUrl = useSelector((state) => state.services.itemsByArtifact.metadata.url);
    const authorizationHeader = useAuthorizationHeader();

    const [summaryData, setSummaryData] = useState({});
    
    dataset = dataset || {};

    const handleDeleteDataType = async (dataType) => {
        console.debug(dataset, dataType);
        dispatch(deleteDatasetDataType(dataset.identifier, dataType.id));
    }
    
    useEffect(() => {
        const fetchDataTypeDetails = async () => {
            const options = {
                method: "GET",
                headers: new Headers({"Content-Type": "application/json", ...authorizationHeader}),
            }
            const response = await fetch(`${katsuUrl}/datasets/${dataset.identifier}/summary`, options)
            const data = await response.json();
            setSummaryData(data);
            console.debug(data);
        }

        fetchDataTypeDetails().catch(console.error)
    }, [project, dataset])

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
                )
            }
        ] : null)
    ];
    
    const dataTypes = Object.keys(summaryData).map(key => {
        return {
            ...summaryData[key],
            name: key,
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
                rowKey="name"
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
