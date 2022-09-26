import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Spin, TreeSelect } from "antd";

const DatasetTreeSelect = ({ value, onChange }) => {
    const projects = useSelector((state) => state.projects.items);
    const projectTables = useSelector((state) => state.projectTables.itemsByProjectID);
    const servicesLoading = useSelector((state) => state.services.isFetchingAll);
    const projectsLoading = useSelector((state) => state.projects.isFetching);

    const selectTreeData = projects.map((p) => ({
        title: p.title,
        selectable: false,
        key: `project:${p.identifier}`,
        value: `project:${p.identifier}`,
        data: p,
        children: p.datasets.map((d) => ({
            title: d.title,
            selectable: true,
            key: `dataset:${d.identifier}`,
            value: `dataset:${d.identifier}`,
            data: d,
            isLeaf: true,
            disabled: !projectTables[p.identifier]?.some((t) => t.dataset === d.identifier),
        })),
    }));

    return (
        <Spin spinning={servicesLoading || projectsLoading}>
            <TreeSelect
                showSearch={true}
                filterTreeNode={(v, n) => {
                    const filter = v.toLocaleLowerCase().trim();
                    return (
                        n.key.toLocaleLowerCase().includes(filter) ||
                        n.props.data.title.toLocaleLowerCase().includes(filter) ||
                        (n.props.data.dataType || "").toLocaleLowerCase().includes(filter)
                    );
                }}
                onChange={onChange}
                value={value}
                treeData={selectTreeData}
                treeDefaultExpandAll={true}
            />
        </Spin>
    );
};

DatasetTreeSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
};

export default DatasetTreeSelect;
