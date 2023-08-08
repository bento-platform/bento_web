import React, {useState, useMemo} from "react";
import {Table, Modal, Icon} from "antd";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";

const COLUMNS_LAST_CONTENT = [
    {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (date) => formatDate(date),
    },
    {title: "Data Type", dataIndex: "dataType", key: "dataType"},
    {title: "Table ID", dataIndex: "tableId", key: "tableId"},
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
        render: (fileNames, record) => <FileNamesCell fileNames={fileNames} dataType={record.dataType}/>,
    },
];

const modalListStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const formatDate = (date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleString("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

function FileNamesCell({fileNames, dataType}) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    // If fileNames exceed 4, truncates list for initial display
    // with the middle replaced by an 'more' icon.
    const isTruncated = fileNames.length > 4;
    const truncatedFileNames = isTruncated
        ? [...fileNames.slice(0, 2), <Icon type="more" key="more-icon"/>, ...fileNames.slice(-2)]
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

    const openModal = () => isTruncated && setIsModalVisible(true);

    const closeModal = () => setIsModalVisible(false);

    return (
        <>
            <div onClick={openModal} style={divStyle}>
                {truncatedFileNames.map((element, index) =>
                    typeof element === "string" ? <div key={index}>{element}</div> : element,
                )}
            </div>
            <Modal
                title={`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} files`}
                footer={null}
                visible={isModalVisible}
                onCancel={closeModal}
                bodyStyle={{maxHeight: "80vh", overflowY: "auto", whiteSpace: "text-overflow"}}
            >
                 <ul style={{ padding: "0 20px", listStyle: "none" }}>
                    {fileNames.map((fileName, index) => (
                        <li key={index} style={modalListStyle}>- {fileName}</li>
                    ))}
                </ul>
            </Modal>
        </>
    );
}

FileNamesCell.propTypes = {
    fileNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    dataType: PropTypes.string.isRequired,
};

const buildKeyFromRecord = (record) => `${record.dataType}-${record.tableId}`;

const fileNameFromPath = (path) => path.split("/").at(-1);

const getFileInputsFromWorkflowMetadata = (workflowMetadata) => {
    return workflowMetadata.inputs
        .filter(input => input.type === "file" || input.type === "file[]")
        .map(input => `${workflowMetadata.id}.${input.id}`);
};

const processIngestions = (data, currentTables) => {
    const currentTableIds = new Set((currentTables || []).map((table) => table.table_id));

    const ingestionsByDataType = data.reduce((ingestions, run) => {
        if (run.state !== "COMPLETE") {
            return ingestions;
        }

        const { workflow_metadata: workflowMetadata, table_id: tableId } = run.details.request.tags;

        if (tableId === undefined || !currentTableIds.has(tableId)) {
            return ingestions;
        }

        const fileNames =
            getFileInputsFromWorkflowMetadata(run.details.request.tags.workflow_metadata)
                .flatMap(key => {
                    const paramValue = run.details.request.workflow_params[key];
                    if (!paramValue) {
                        // Key isn't in workflow params or is null
                        // - possibly optional field or something else going wrong
                        return [];
                    }
                    return Array.isArray(paramValue) ? paramValue : [paramValue];
                })
                .map(fileNameFromPath);

        const date = Date.parse(run.details.run_log.end_time);

        const currentIngestion = { date, dataType: workflowMetadata.data_type, tableId, fileNames };
        const dataTypeAndTableId = buildKeyFromRecord(currentIngestion);

        if (ingestions[dataTypeAndTableId]) {
            const existingDate = ingestions[dataTypeAndTableId].date;
            if (date > existingDate) {
                ingestions[dataTypeAndTableId].date = date;
            }
            ingestions[dataTypeAndTableId].fileNames.push(...fileNames);
        } else {
            ingestions[dataTypeAndTableId] = currentIngestion;
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
