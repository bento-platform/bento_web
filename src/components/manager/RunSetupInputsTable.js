import React from "react";
import PropTypes from "prop-types";
import {Table} from "antd";
import {EM_DASH} from "../../constants";

const RunSetupInputsTable = ({selectedWorkflow, inputs}) => (
    <Table
        size="small"
        bordered={true}
        showHeader={false}
        pagination={false}
        columns={[
            {
                title: "ID",
                dataIndex: "id",
                render: iID => <span style={{fontWeight: "bold", marginRight: "0.5em"}}>{iID}</span>,
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
                        )
            }
        ]}
        rowKey="id"
        dataSource={selectedWorkflow.inputs.map(i => ({id: i.id, value: inputs[i.id]}))}
    />
);
RunSetupInputsTable.propTypes = {
    selectedWorkflow: PropTypes.object,
    inputs: PropTypes.object,
};

export default RunSetupInputsTable;
