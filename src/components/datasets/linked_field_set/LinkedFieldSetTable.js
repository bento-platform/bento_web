import React, {Component} from "react";
import PropTypes from "prop-types";

import {Table} from "antd";
import "antd/es/table/style/css";

import {linkedFieldSetPropTypesShape} from "../../../propTypes";

const COLUMNS = [
    {dataIndex: "dataType", title: "Data Type"},
    {dataIndex: "field", title: "Field", render: f => <span style={{fontFamily: "monospace"}}>{f.join(".")}</span>},
];

class LinkedFieldSetTable extends Component {
    render() {
        const data = Object.entries(this.props.linkedFieldSet.fields)
            .map(([dataType, field]) => ({dataType, field}))
            .sort((a, b) =>
                a.dataType.localeCompare(b.dataType));
        return <Table columns={COLUMNS}
                      dataSource={data}
                      rowKey="dataType"
                      size={this.props.inModal ? "small" : "middle"}
                      bordered={true} />;
    }
}

LinkedFieldSetTable.propTypes = {
    linkedFieldSet: linkedFieldSetPropTypesShape,
    inModal: PropTypes.bool,
};

export default LinkedFieldSetTable;
