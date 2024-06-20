import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Table, Modal } from "antd";
import { MoreOutlined } from "@ant-design/icons";

const COLUMNS_LAST_CONTENT = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (date) => formatDate(date),
  },
  { title: "Data Type", dataIndex: "dataType", key: "dataType" },
  { title: "Dataset ID", dataIndex: "datasetId", key: "datasetId" },
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

function FileNamesCell({ fileNames, dataType }) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // If fileNames exceed 4, truncates list for initial display
  // with the middle replaced by an 'more' icon.
  const isTruncated = fileNames.length > 4;
  const truncatedFileNames = isTruncated
    ? [...fileNames.slice(0, 2), <MoreOutlined key="more-icon" />, ...fileNames.slice(-2)]
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
        open={isModalVisible}
        onCancel={closeModal}
        styles={{ body: { maxHeight: "80vh", overflowY: "auto", whiteSpace: "text-overflow" } }}
      >
        <ul style={{ padding: "0 20px", listStyle: "none" }}>
          {fileNames.map((fileName, index) => (
            <li key={index} style={modalListStyle}>
              - {fileName}
            </li>
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

const buildKeyFromRecord = (record) => `${record.dataType}-${record.datasetId}`;

const fileNameFromPath = (path) => path.split("/").at(-1);

const namespacedInput = (workflowId, input) => `${workflowId}.${input.id}`;

const getFirstProjectDatasetInputFromWorkflow = (workflowId, { inputs }) =>
  inputs.filter((input) => input.type === "project:dataset").map((input) => namespacedInput(workflowId, input))[0];

const getFileInputsFromWorkflow = (workflowId, { inputs }) =>
  inputs.filter((input) => ["file", "file[]"].includes(input.type)).map((input) => namespacedInput(workflowId, input));

const processIngestions = (data, currentDatasets) => {
  const currentDatasetIds = new Set((currentDatasets || []).map((ds) => ds.identifier));

  const ingestions = {};

  data.forEach((run) => {
    if (run.state !== "COMPLETE") {
      return;
    }

    const workflowParams = run.details.request.workflow_params;
    const { workflow_id: workflowId, workflow_metadata: workflowMetadata } = run.details.request.tags;

    const projectDatasetKey = getFirstProjectDatasetInputFromWorkflow(workflowId, workflowMetadata);
    if (!projectDatasetKey) {
      return;
    }

    const datasetId = workflowParams[projectDatasetKey].split(":")[1];
    if (datasetId === undefined || !currentDatasetIds.has(datasetId)) {
      return;
    }

    if (!workflowMetadata.data_type) {
      return;
    }

    const fileNames = getFileInputsFromWorkflow(workflowId ?? workflowMetadata.id, workflowMetadata)
      .flatMap((key) => {
        const paramValue = workflowParams[key];
        if (!paramValue) {
          // Key isn't in workflow params or is null
          // - possibly optional field or something else going wrong
          return [];
        }
        return Array.isArray(paramValue) ? paramValue : [paramValue];
      })
      .map(fileNameFromPath);

    const date = Date.parse(run.details.run_log.end_time);

    const currentIngestion = { date, dataType: workflowMetadata.data_type, datasetId, fileNames };
    const dataTypeAndDatasetId = buildKeyFromRecord(currentIngestion);

    if (ingestions[dataTypeAndDatasetId]) {
      const existingDate = ingestions[dataTypeAndDatasetId].date;
      if (date > existingDate) {
        ingestions[dataTypeAndDatasetId].date = date;
      }
      ingestions[dataTypeAndDatasetId].fileNames.push(...fileNames);
    } else {
      ingestions[dataTypeAndDatasetId] = currentIngestion;
    }
  }, {});

  return Object.values(ingestions).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
};

const LastIngestionTable = () => {
  const servicesFetching = useSelector((state) => state.services.isFetchingAll);
  const { items: runs, isFetching: runsFetching } = useSelector((state) => state.runs);
  const currentProjects = useSelector((state) => state.projects.items);
  const currentDatasets = useMemo(() => currentProjects.flatMap((p) => p.datasets), [currentProjects]);
  const ingestions = useMemo(() => processIngestions(runs, currentDatasets), [runs, currentDatasets]);

  return (
    <Table
      bordered={true}
      size="middle"
      columns={COLUMNS_LAST_CONTENT}
      loading={servicesFetching || runsFetching}
      dataSource={ingestions}
      rowKey={buildKeyFromRecord}
      pagination={false}
    />
  );
};

export default LastIngestionTable;
