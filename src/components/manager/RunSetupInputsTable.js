import React, {useMemo} from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Table } from "antd";
import { EM_DASH } from "../../constants";

const RunSetupInputsTable = ({ selectedWorkflow, inputs }) => {
    const projectsByID = useSelector(state => state.projects.itemsByID);
    const datasetsByID = useSelector((state) => state.projects.datasetsByID);

    const columns = useMemo(() => [
        {
            title: "ID",
            dataIndex: "id",
            render: iID => <span style={{ fontWeight: "bold", marginRight: "0.5em" }}>{iID}</span>,
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
                    return <div>
                        <strong>Project:</strong> {projectsByID[projectID]?.title}<br />
                        <strong>Dataset:</strong> {datasetsByID[datasetID]?.title}
                    </div>;
                }

                if (Array.isArray(value)) {
                    return <ul style={{margin: 0, paddingLeft: "1rem"}}>
                        {value.map(v => <li key={v.toString()}>{v.toString()}</li>)}
                    </ul>;
                }

                return value.toString();
            },
        },
    ], [projectsByID, datasetsByID]);

    const dataSource = useMemo(
        () => selectedWorkflow.inputs
            .filter(i => !(i.hidden ?? false) && !i.injected)
            .map(i => ({ id: i.id, value: inputs[i.id], inputConfig: i })),
        [inputs]);

    return (
        <Table
            size="small"
            bordered={true}
            showHeader={false}
            pagination={false}
            columns={columns}
            rowKey="id"
            dataSource={dataSource}
        />
    );
};
RunSetupInputsTable.propTypes = {
    selectedWorkflow: PropTypes.object,
    inputs: PropTypes.object,
};

export default RunSetupInputsTable;
