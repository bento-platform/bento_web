import React from "react";
import {Table} from "antd";
import {linkedFieldSetPropTypesShape} from "@/propTypes";
import MonospaceText from "@/components/MonospaceText";

const COLUMNS = [
    { dataIndex: "dataType", title: "Data Type" },
    { dataIndex: "field", title: "Field", render: (f) => <MonospaceText>{f.join(".")}</MonospaceText> },
];

const LinkedFieldSetTable = ({ linkedFieldSet }) => {
    const data = Object.entries(linkedFieldSet.fields)
        .map(([dataType, field]) => ({dataType, field}))
        .sort((a, b) =>
            a.dataType.localeCompare(b.dataType));

    return (
        <Table
            columns={COLUMNS}
            dataSource={data}
            rowKey="dataType"
            pagination={false}
            size="small"
            bordered={true}
        />
    );
};

LinkedFieldSetTable.propTypes = {
    linkedFieldSet: linkedFieldSetPropTypesShape,
};

export default LinkedFieldSetTable;
