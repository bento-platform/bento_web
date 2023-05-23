import React, { useState, useMemo } from "react";
import { Table, Modal, Icon } from "antd";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const COLUMNS_LAST_CONTENT = [
    { title: "Date", dataIndex: "date", key: "date"},
    { title: "Data Type", dataIndex: "dataType", key: "dataType"},
    { title: "Table ID", dataIndex: "tableId", key: "tableId"},
    {
        title: "Ingested Files",
        dataIndex: "fileNames",
        key: "fileNamesLength",
        render: (fileNames) => fileNames.length,
    },
    {
        title: "File Names",
        dataIndex: "fileNames",
        key: "fileNames",
        render: (fileNames, record) => <FileNamesCell fileNames={fileNames} dataType={record.dataType} />,
    },
];

function FileNamesCell({ fileNames, dataType }) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const isTruncated = fileNames.length > 4;
    const truncatedFileNames = isTruncated
        ? [...fileNames.slice(0, 2), <Icon type="more" key="more-icon" />, ...fileNames.slice(-2)]
        : fileNames;

    const divStyle = isTruncated
        ? {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            cursor: "pointer",
        }
        : {};

    const openModal = () => {
        if (isTruncated) setIsModalVisible(true);
    };

    const closeModal = () => setIsModalVisible(false);

    return (
        <>
            <div onClick={openModal} style={divStyle}>
                {truncatedFileNames.map((element, index) =>
                    typeof element === "string" ? <div key={index}>{element}</div> : element
                )}
            </div>
            <Modal
                title={`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} files`}
                footer={null}
                visible={isModalVisible}
                onCancel={closeModal}
                bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
            >
                {fileNames.map((fileName, index) => (
                    <div key={index}>{fileName}</div>
                ))}
            </Modal>
        </>
    );
}

FileNamesCell.propTypes = {
    fileNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    dataType: PropTypes.string.isRequired,
};

const buildKeyFromRecord = (record) => `${record.dataType}-${record.tableId}`;

const fileNameFromPath = (path) => path.split("/").pop();

const getFileNameKey = (dataType, workflowParams) =>
    dataType === "variant"
        ? "vcf_gz.vcf_gz_file_names" // vcf_gz file names
        : Object.keys(workflowParams)[0];

const getDateFromEndTime = (endTime) => endTime.split("T")[0];

const processIngestions = (data, currentTables) => {
    const currentTableIds = new Set((currentTables || []).map((table) => table.table_id));

    const ingestionsByDataType = data.reduce((ingestions, run) => {
        if (run.state === "COMPLETE") {
            const dataType = run.details.request.tags.workflow_metadata.data_type;
            const tableId = run.details.request.tags.table_id;

            if (tableId === undefined || !currentTableIds.has(tableId)) {
                return ingestions;
            }

            const fileNameKey = getFileNameKey(dataType, run.details.request.workflow_params);
            const filePaths = run.details.request.workflow_params[fileNameKey];
            const fileNames = Array.isArray(filePaths)
                ? filePaths.map(fileNameFromPath)
                : [fileNameFromPath(filePaths)];

            const dateStr = getDateFromEndTime(run.details.run_log.end_time);
            const date = Date.parse(dateStr);

            const currentIngestion = { date: dateStr, dataType, tableId, fileNames };
            const dataTypeAndTableId = buildKeyFromRecord(currentIngestion);

            if (!ingestions[dataTypeAndTableId]) {
                ingestions[dataTypeAndTableId] = currentIngestion;
            } else {
                const existingDate = Date.parse(ingestions[dataTypeAndTableId].date);
                if (date > existingDate) {
                    ingestions[dataTypeAndTableId].date = dateStr;
                }
                ingestions[dataTypeAndTableId].fileNames.push(...fileNames);
            }
        }
        return ingestions;
    }, {});

    return Object.values(ingestionsByDataType).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
};

const LastIngestionTable = () => {
    const runs = useSelector((state) => state.runs.items);
    const currentTables = useSelector((state) => state.projectTables.items);
    const ingestions = useMemo(() => processIngestions(runs, currentTables), [runs, currentTables]);

    return <Table bordered={true} columns={COLUMNS_LAST_CONTENT} dataSource={ingestions} rowKey={buildKeyFromRecord} />;
};

export default LastIngestionTable;
