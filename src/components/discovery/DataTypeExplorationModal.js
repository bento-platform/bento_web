import React, {Component} from "react";
import PropTypes from "prop-types";

import {Divider, Input, Modal, Radio, Table, Tabs, Typography} from "antd";
import { ShareAltOutlined, TableOutlined } from "@ant-design/icons";

import SchemaTree from "../schema_trees/SchemaTree";
import {generateSchemaTreeData, generateSchemaTableData} from "../../utils/schema";
import {nop} from "../../utils/misc";

// TODO: Add more columns
const FIELD_COLUMNS = [
    {title: "Key", dataIndex: "key", render: t =>
            <span style={{fontFamily: "monospace", fontSize: "12px", whiteSpace: "nowrap"}}>{t}</span>},
    {title: "JSON Type", dataIndex: ["data", "type"]},
    {title: "Description", dataIndex: ["data", "description"]},
];

class DataTypeExplorationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "table",
            filter: "",
        };

        this.onFilterChange = this.onFilterChange.bind(this);
        this.applyFilterToTableData = this.applyFilterToTableData.bind(this);
        this.getTableData = this.getTableData.bind(this);
    }

    onFilterChange(v) {
        this.setState({filter: v.toLocaleLowerCase().trim()});
    }

    applyFilterToTableData(l) {
        return this.state.filter === ""
            ? l
            : l.filter(f =>
                f.key.toLocaleLowerCase().includes(this.state.filter)
                || (f.data.description || "").toLocaleLowerCase().includes(this.state.filter));
    }

    getTableData(d) {
        // TODO: Cache tree data for data type
        return this.applyFilterToTableData(generateSchemaTableData(generateSchemaTreeData(d.schema)));
    }

    render() {
        const filteredDataTypes = this.props.dataTypes || [];

        const tabItems = filteredDataTypes.map((dataType) => ({
            key: dataType.id,
            label: dataType.label ?? dataType.id,
            children: this.state.view === "tree" ? (
                <SchemaTree schema={dataType.schema} />
            ) : (
                <>
                    <Input.Search
                        allowClear={true}
                        onChange={e => this.onFilterChange(e.target.value)}
                        placeholder="Search for a field..."
                        style={{marginBottom: "16px"}}
                    />
                    <Table
                        bordered={true}
                        columns={FIELD_COLUMNS}
                        dataSource={this.getTableData(dataType)}
                    />
                </>
            ),
        }));

        return <Modal title="Help"
                      open={this.props.open}
                      width={1280}
                      onCancel={this.props.onCancel || nop}
                      footer={null}>
            <Typography.Paragraph>
                Bento separate data types across multiple queryable data services. For instance,
                clinical and phenotypic data is stored in the Katsu data service, while genomic data
                is stored in the Gohan data service. Each data service has its own set of queryable
                properties, and parameters for multiple data types can be used in the same query. If
                two or more data types are queried at the same time, an aggregation service will look
                for datasets that have linked data objects matching both criteria.
            </Typography.Paragraph>
            <Typography.Paragraph>
                To run a query on a data type, click on the &ldquo;Query Data Type&rdquo; button and choose the data
                type you want to add query conditions on.
            </Typography.Paragraph>

            <Divider />

            <Typography.Title level={3}>Data Types</Typography.Title>
            <div style={{position: "relative"}}>
                <Radio.Group value={this.state.view}
                             onChange={e => this.setState({view: e.target.value})}
                             buttonStyle="solid"
                             style={{position: "absolute", top: 0, right: 0, zIndex: 50}}>
                    <Radio.Button value="tree"><ShareAltOutlined /> Tree View</Radio.Button>
                    <Radio.Button value="table"><TableOutlined /> Table Detail View</Radio.Button>
                </Radio.Group>
                <Tabs items={tabItems} />
            </div>
        </Modal>;
    }
}

DataTypeExplorationModal.propTypes = {
    dataTypes: PropTypes.array,  // TODO: Shape
    open: PropTypes.bool,
    onCancel: PropTypes.func,
};

export default DataTypeExplorationModal;
