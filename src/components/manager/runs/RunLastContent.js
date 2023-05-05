import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { useSelector } from "react-redux";

const COLUMNS_LAST_CONTENT = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Data Type", dataIndex: "dataType", key: "dataType" },
    { title: "Table ID", dataIndex: "tableId", key: "tableId" },
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
        render: (fileNames) => (
            <>
                {fileNames.map((fileName, index) => (
                    <div key={index}>{fileName}</div>
                ))}
            </>
        ),
    },
];

const processIngestions = (data) => {
    const ingestionsByDataType = data.reduce((acc, obj) => {
        if (obj.state === "COMPLETE") {
            const dataType = obj.details.request.tags.workflow_metadata.data_type;
            const tableId = obj.details.request.tags.table_id;

            if (tableId === undefined) {
                return acc;
            }

            const fileNameKey = Object.keys(obj.details.request.workflow_params)[0];
            const filePath = obj.details.request.workflow_params[fileNameKey];
            const fileName = filePath.split("/").pop();
            const dateStr = obj.details.run_log.end_time.split("T")[0];
            const date = Date.parse(dateStr);

            const currentIngestion = { date: dateStr, dataType, tableId, fileNames: [fileName] };

            if (!acc[dataType]) {
                acc[dataType] = currentIngestion;
            } else if (date > Date.parse(acc[dataType].date)) {
                Object.assign(acc[dataType], currentIngestion);
            } else if (date === Date.parse(acc[dataType].date)) {
                acc[dataType].fileNames.push(fileName);
            }
        }
        return acc;
    }, {});

    return Object.values(ingestionsByDataType).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
};

const LastIngestionTable = () => {
    const runs = useSelector((state) => state.runs.items);
    const [ingestions, setIngestions] = useState([]);

    useEffect(() => {
        const formattedIngestions = processIngestions(runs);
        setIngestions(formattedIngestions);
    }, [runs]);

    return (
        <Table
            bordered={true}
            columns={COLUMNS_LAST_CONTENT}
            dataSource={ingestions}
            rowKey={(record) => `${record.dataType}-${record.tableId}`}
        />
    );
};

export default LastIngestionTable;
