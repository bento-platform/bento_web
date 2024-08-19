import { memo } from "react";
import PropTypes from "prop-types";
import { Table } from "antd";

import { EM_DASH } from "@/constants";
import ProjectTitleDisplay from "@/components/manager/ProjectTitleDisplay";
import DatasetTitleDisplay from "@/components/manager/DatasetTitleDisplay";

const COLUMNS = [
  {
    title: "ID",
    dataIndex: "id",
    render: (iID) => <span style={{ fontWeight: "bold", marginRight: "0.5em" }}>{iID}</span>,
  },
  {
    title: "Value",
    dataIndex: "value",
    render: (value, input) => {
      if (value === undefined) {
        return EM_DASH;
      }

      // TODO: link these to new tab: manager page on project/dataset (when we can route datasets)
      if (input.inputConfig.type === "project:dataset") {
        const [projectID, datasetID] = value.split(":");
        return (
          <div>
            <strong>Project:</strong> <ProjectTitleDisplay projectID={projectID} />
            <br />
            <strong>Dataset:</strong> <DatasetTitleDisplay datasetID={datasetID} />
          </div>
        );
      }

      if (Array.isArray(value)) {
        return (
          <ul style={{ margin: 0, paddingLeft: "1rem" }}>
            {value.map((v) => (
              <li key={v.toString()}>{v.toString()}</li>
            ))}
          </ul>
        );
      }

      return value.toString();
    },
  },
];

const RunSetupInputsTable = memo(({ selectedWorkflow, inputs }) => {
  const dataSource = selectedWorkflow.inputs
    .filter((i) => !(i.hidden ?? false) && !i.injected)
    .map((i) => ({ id: i.id, value: inputs[i.id], inputConfig: i }));

  return (
    <Table
      size="small"
      bordered={true}
      showHeader={false}
      pagination={false}
      columns={COLUMNS}
      rowKey="id"
      dataSource={dataSource}
    />
  );
});
RunSetupInputsTable.propTypes = {
  selectedWorkflow: PropTypes.object,
  inputs: PropTypes.object,
};

export default RunSetupInputsTable;
