import React from "react";
import PropTypes from "prop-types";

import { Table } from "antd";

import { linkedFieldSetPropTypesShape } from "../../../propTypes";

const COLUMNS = [
    { dataIndex: "dataType", title: "Data Type" },
    {
        dataIndex: "field",
        title: "Field",
        render: (f) => (
            <span style={{ fontFamily: "monospace" }}>{f.join(".")}</span>
        ),
    },
];

const LinkedFieldSetTable = ({ linkedFieldSet, inModal }) => {
    const data = Object.entries(linkedFieldSet.fields)
        .map(([dataType, field]) => ({ dataType, field }))
        .sort((a, b) => a.dataType.localeCompare(b.dataType));
    return (
        <Table
            columns={COLUMNS}
            dataSource={data}
            rowKey="dataType"
            size={inModal ? "small" : "middle"}
            bordered={true}
        />
    );
};

LinkedFieldSetTable.propTypes = {
    linkedFieldSet: linkedFieldSetPropTypesShape,
    inModal: PropTypes.bool,
};

export default LinkedFieldSetTable;
