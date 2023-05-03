import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { useSelector} from "react-redux";

const LastIngestionTable = () => {
    const runs = useSelector((state) => state.runs.items);

    const [ingestions, setIngestions] = useState([]);

    const processIngestions = (data) => {
        const latestIngestions = data.reduce((acc, obj) => {
            if (obj.state === "COMPLETE") {
                const dataType = obj.details.request.tags.workflow_metadata.data_type;
                const tableId = obj.details.request.tags.table_id;
                // Skip the process if the tableId is undefined
                if (tableId === undefined) {
                    return acc;
                }
                const fileNameKey = Object.keys(obj.details.request.workflow_params)[0];
                const filePath = obj.details.request.workflow_params[fileNameKey];
                const fileName = filePath.split("/").pop();
                const date = obj.details.run_log.end_time.split("T")[0];

                const currentIngestion = { date, dataType, tableId, ingestedFiles: 1, fileNames: [fileName] };

                const existingIngestion = acc.find((elem) => elem.dataType === dataType);

                if (!existingIngestion) {
                    acc.push(currentIngestion);
                } else if (date > existingIngestion.date) {
                    Object.assign(existingIngestion, currentIngestion);
                } else if (date === existingIngestion.date) {
                    existingIngestion.ingestedFiles += 1;
                    existingIngestion.fileNames.push(fileName);
                }
            }
            return acc;
        }, []);

        return latestIngestions;
    };

    useEffect(() => {
        const formattedIngestions = processIngestions(runs);
        setIngestions(formattedIngestions);
    }, [runs]);

    const columns = [
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Data Type", dataIndex: "dataType", key: "dataType" },
        { title: "Table ID", dataIndex: "tableId", key: "tableId" },
        { title: "Ingested Files", dataIndex: "ingestedFiles", key: "ingestedFiles" },
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

    return (
        <Table
            bordered={true}
            columns={columns}
            dataSource={ingestions}
            rowKey={(record) => `${record.dataType}-${record.tableId}`}
        />
    );
};

export default LastIngestionTable;
