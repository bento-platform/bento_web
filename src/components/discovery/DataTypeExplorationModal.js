import React, {Component} from "react";
import PropTypes from "prop-types";

import {Icon, Input, Modal, Radio, Table, Tabs} from "antd";

import SchemaTree from "../schema_trees/SchemaTree";
import {generateSchemaTreeData, generateSchemaTableData} from "../../utils/schema";
import {nop} from "../../utils/misc";

// TODO: Add more columns
const FIELD_COLUMNS = [
    {title: "Key", dataIndex: "key", render: t =>
            <span style={{fontFamily: "monospace", fontSize: "12px", whiteSpace: "nowrap"}}>{t}</span>},
    {title: "JSON Type", dataIndex: "data.type"},
    {title: "Description", dataIndex: "data.description"},
];

class DataTypeExplorationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "table",
            filter: ""
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
        return <Modal title="Data Types"
                      visible={this.props.visible}
                      width={1280}
                      onCancel={this.props.onCancel || nop}
                      footer={null}>
            <Radio.Group value={this.state.view}
                         onChange={e => this.setState({view: e.target.value})}
                         buttonStyle="solid"
                         style={{position: "absolute", top: "73px", right: "24px", zIndex: "50"}}>
                <Radio.Button value="tree"><Icon type="share-alt" /> Tree View</Radio.Button>
                <Radio.Button value="table"><Icon type="table" /> Table Detail View</Radio.Button>
            </Radio.Group>
            <Tabs>
                {Object.values(this.props.dataTypes).flatMap(ds => (ds.items || []).map(d => (
                    <Tabs.TabPane tab={d.id} key={d.id}>
                        {this.state.view === "tree" ? (
                            <SchemaTree schema={d.schema} />
                        ) : (
                            <>
                                <Input.Search allowClear={true}
                                              onChange={e => this.onFilterChange(e.target.value)}
                                              placeholder="Search for a field..." style={{marginBottom: "16px"}} />
                                <Table bordered={true}
                                       columns={FIELD_COLUMNS}
                                       dataSource={this.getTableData(d)} />
                            </>
                        )}
                    </Tabs.TabPane>
                )))}
            </Tabs>
        </Modal>;
    }
}

DataTypeExplorationModal.propTypes = {
    dataTypes: PropTypes.object,  // TODO: Shape
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
};

export default DataTypeExplorationModal;
