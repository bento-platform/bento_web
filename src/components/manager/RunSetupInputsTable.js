import React, {useMemo} from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { EM_DASH } from "../../constants";

const RUN_SETUP_INPUTS_COLUMNS = [
    {
        title: "ID",
        dataIndex: "id",
        render: iID => <span style={{ fontWeight: "bold", marginRight: "0.5em" }}>{iID}</span>,
    },
    {
        title: "Value",
        dataIndex: "value",
        render: value =>
            value === undefined
                ? EM_DASH
                : (
                    value instanceof Array
                        ? <ul>{value.map(v => <li key={v.toString()}>{v.toString()}</li>)}</ul>
                        : value.toString()
                ),
    },
];

const RunSetupInputsTable = ({ selectedWorkflow, inputs }) => {
    const dataSource = useMemo(
        () => selectedWorkflow.inputs
            .filter(i => !(i.hidden ?? false))
            .map(i => ({ id: i.id, value: inputs[i.id] })),
        [inputs]);
    return (
        <Table
            size="small"
            bordered={true}
            showHeader={false}
            pagination={false}
            columns={RUN_SETUP_INPUTS_COLUMNS}
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
