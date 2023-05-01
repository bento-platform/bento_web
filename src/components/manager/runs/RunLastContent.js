import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchRuns } from "../../../modules/wes/actions";

const LastIngestionTable = ({ runs, fetchRuns }) => {
    const [ingestions, setIngestions] = useState([]);

    const processIngestions = (data) => {
        const latestIngestions = data.reduce((acc, obj) => {
            if (obj.state === "COMPLETE") {
                const dataType = obj.details.request.tags.workflow_metadata.data_type;
                const tableId = obj.details.request.tags.table_id;
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
        async function fetchIngestions() {
            try {
                await fetchRuns({ with_details: true });
            } catch (error) {
                console.error("Error fetching ingestions:", error);
            }
        }

        fetchIngestions();
    }, [fetchRuns]);

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

LastIngestionTable.propTypes = {
    runs: PropTypes.array.isRequired,
    fetchRuns: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
    return {
        runs: state.runs.items,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchRuns: (queryParams) => dispatch(fetchRuns(queryParams)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LastIngestionTable);
