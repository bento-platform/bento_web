import React, { memo } from "react";
import { Table } from "antd";
import { runPropTypesShape } from "../../../propTypes";

const renderOutputValue = (value) => {
    if (Array.isArray(value)) {
        return (
            <ul>
                {value.map((v, vi) => (
                    <li key={vi.toString()}>
                        {renderOutputValue(v)}
                    </li>
                ))}
            </ul>
        );
    } else if (typeof value === "object") {
        return (
            <span style={{ fontFamily: "monospace" }}>{JSON.stringify(value)}</span>
        );
    } else {
        return (
            <span style={{ fontFamily: "monospace" }}>{value.toString()}</span>
        );
    }
}

const COLUMNS = [
    {
        title: "Name",
        dataIndex: "name",
        render: (name) => <span style={{ fontFamily: "monospace" }}>{name}</span>,
    },
    {
        title: "Value",
        dataIndex: "value",
        render: (value) => renderOutputValue(value),
    },
    // {
    //     key: "actions",
    //     title: "Actions",
    //     render: () => <>TODO</>,
    // },
];

const RunOutputs = memo(({ run }) => {
    const outputItems = Object.entries(run.details?.outputs ?? {}).map(([k, v]) => ({
        name: k,
        value: v,
    }));

    return (
        <Table
            columns={COLUMNS}
            dataSource={outputItems}
            rowKey="name"
            bordered={true}
            size="middle"
            pagination={false}
        />
    );
});
RunOutputs.propTypes = {
    run: runPropTypesShape,
};

export default RunOutputs;
