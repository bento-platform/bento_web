import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Spin, Tag, TreeSelect } from "antd";

const TableTreeSelect = ({ value, onChange }) => {
    // TODO: Handle table loading better

    const projects = useSelector((state) => state.projects.items);
    const projectTables = useSelector(
        (state) => state.projectTables.itemsByProjectID
    );
    const tablesByServiceID = useSelector(
        (state) => state.serviceTables.itemsByServiceID
    );
    const servicesLoading = useSelector(
        (state) => state.services.isFetchingAll
    );
    const projectsLoading = useSelector((state) => state.projects.isFetching);

    const getTableName = (serviceID, tableID) =>
        tablesByServiceID[serviceID]?.tablesByID?.[tableID]?.name;

    const tableListTreeData = projects.map((p) => ({
        title: p.title,
        selectable: false,
        key: `project:${p.identifier}`,
        value: `project:${p.identifier}`,
        data: p,
        children: p.datasets.map((d) => ({
            title: d.title,
            selectable: false,
            key: `dataset:${d.identifier}`,
            value: `dataset:${d.identifier}`,
            data: d,
            children: (projectTables[p.identifier] ?? [])
                .filter(
                    (t) =>
                        t.dataset === d.identifier &&
                        (
                            tablesByServiceID?.[t.service_id]?.tablesByID ?? {}
                        ).hasOwnProperty(t.table_id)
                )
                .map((t) => ({
                    ...t,
                    tableName: getTableName(t.service_id, t.table_id) ?? "",
                    dataType:
                        tablesByServiceID[t.service_id].tablesByID[t.table_id]
                            .data_type,
                }))
                .map((t) => ({
                    title: (
                        <>
                            <Tag style={{ marginRight: "1em" }}>
                                {t.dataType}
                            </Tag>
                            {t.tableName}&nbsp; (
                            <span style={{ fontFamily: "monospace" }}>
                                {t.table_id}
                            </span>
                            )
                        </>
                    ),
                    isLeaf: true,
                    key: `${p.identifier}:${t.dataType}:${t.table_id}`,
                    value: `${p.identifier}:${t.dataType}:${t.table_id}`,
                    data: t,
                })),
        })),
    }));

    return (
        <Spin spinning={servicesLoading || projectsLoading}>
            <TreeSelect
                showSearch
                filterTreeNode={(v, n) => {
                    const filter = v.toLocaleLowerCase().trim();
                    if (filter === "") return true;
                    return (
                        n.key.toLocaleLowerCase().includes(filter) ||
                        n.props.data.title
                            .toLocaleLowerCase()
                            .includes(filter) ||
                        (n.props.data.dataType || "")
                            .toLocaleLowerCase()
                            .includes(filter)
                    );
                }}
                onChange={onChange}
                value={value}
                treeData={tableListTreeData}
                treeDefaultExpandAll
            />
        </Spin>
    );
};

TableTreeSelect.propTypes = {
    value: PropTypes.string,
    dataType: PropTypes.string,
    onChange: PropTypes.func,
};

export default TableTreeSelect;
