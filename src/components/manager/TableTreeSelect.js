import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Spin, Tag, TreeSelect } from "antd";

const TableTreeSelect = ({
    style,
    value,
    dataType,
    onChange,
    projects,
    projectTables,
    tablesByServiceID,
    servicesLoading,
    projectsLoading,
}) => {
    const [selected, setSelected] = useState(value || undefined);

    const onChangeLocal = (selectedNew) => {
        setSelected(selectedNew);

        // Update the change handler bound to the component
        if (onChange) onChange(selectedNew);
    };

    // TODO: Handle table loading better

    const getTableName = (serviceID, tableID) =>
        tablesByServiceID[serviceID]?.tablesByID?.[tableID]?.name;

    dataType = dataType ?? null;

    const selectTreeData = projects.map((p) => ({
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
                    disabled: !(dataType === null || dataType === t.dataType),
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
                style={style ?? {}}
                showSearch={true}
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
                onChange={onChangeLocal}
                value={selected}
                treeData={selectTreeData}
                treeDefaultExpandAll={true}
            />
        </Spin>
    );
};

TableTreeSelect.propTypes = {
    style: PropTypes.object,

    value: PropTypes.string,

    dataType: PropTypes.string,
    onChange: PropTypes.func,

    projects: PropTypes.array,
    projectTables: PropTypes.object, // TODO: Shape
    tablesByServiceID: PropTypes.objectOf(PropTypes.object), // TODO: Shape

    servicesLoading: PropTypes.bool,
    projectsLoading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    projects: state.projects.items,
    projectTables: state.projectTables.itemsByProjectID,
    tablesByServiceID: state.serviceTables.itemsByServiceID,
    servicesLoading: state.services.isFetchingAll,
    projectsLoading: state.projects.isFetching,
});

export default connect(mapStateToProps)(TableTreeSelect);
