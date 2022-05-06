import React, { useState } from "react";
import PropTypes from "prop-types";

import { Icon, Input, Modal, Radio, Table, Tabs } from "antd";

import SchemaTree from "../schema_trees/SchemaTree";
import {
    generateSchemaTreeData,
    generateSchemaTableData,
} from "../../utils/schema";
import { nop } from "../../utils/misc";

// TODO: Add more columns
const FIELD_COLUMNS = [
    {
        title: "Key",
        dataIndex: "key",
        render: (t) => (
            <span
                style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                }}
            >
                {t}
            </span>
        ),
    },
    { title: "JSON Type", dataIndex: "data.type" },
    { title: "Description", dataIndex: "data.description" },
];

const DataTypeExplorationModal = ({ dataTypes, visible, onCancel }) => {
    const [view, setView] = useState("table");
    const [filter, setFilter] = useState("");

    const onFilterChange = (v) => {
        setFilter(v.toLocaleLowerCase().trim());
    };

    const applyFilterToTableData = (l) => {
        return filter === ""
            ? l
            : l.filter(
                (f) =>
                    f.key.toLocaleLowerCase().includes(filter) ||
                      (f.data.description || "")
                          .toLocaleLowerCase()
                          .includes(filter)
            );
    };

    const getTableData = (d) => {
        // TODO: Cache tree data for data type
        return applyFilterToTableData(
            generateSchemaTableData(generateSchemaTreeData(d.schema))
        );
    };

    return (
        <Modal
            title="Data Types"
            visible={visible}
            width={1280}
            onCancel={onCancel || nop}
            footer={null}
        >
            <Radio.Group
                value={view}
                onChange={(e) => setView(e.target.value)}
                buttonStyle="solid"
                style={{
                    position: "absolute",
                    top: "73px",
                    right: "24px",
                    zIndex: "50",
                }}
            >
                <Radio.Button value="tree">
                    <Icon type="share-alt" /> Tree View
                </Radio.Button>
                <Radio.Button value="table">
                    <Icon type="table" /> Table Detail View
                </Radio.Button>
            </Radio.Group>
            <Tabs>
                {Object.values(dataTypes).flatMap((ds) =>
                    (ds.items || []).map((d) => (
                        <Tabs.TabPane tab={d.id} key={d.id}>
                            {view === "tree" ? (
                                <SchemaTree schema={d.schema} />
                            ) : (
                                <>
                                    <Input.Search
                                        allowClear={true}
                                        onChange={(e) =>
                                            onFilterChange(e.target.value)
                                        }
                                        placeholder="Search for a field..."
                                        style={{ marginBottom: "16px" }}
                                    />
                                    <Table
                                        bordered={true}
                                        columns={FIELD_COLUMNS}
                                        dataSource={getTableData(d)}
                                    />
                                </>
                            )}
                        </Tabs.TabPane>
                    ))
                )}
            </Tabs>
        </Modal>
    );
};

DataTypeExplorationModal.propTypes = {
    dataTypes: PropTypes.object, // TODO: Shape
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
};

export default DataTypeExplorationModal;
