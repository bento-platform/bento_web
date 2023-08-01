import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";

import {Spin, TreeSelect} from "antd";

const DatasetTreeSelect = ({value, onChange, style}) => {
    const {items: projectItems, isFetching: projectsFetching} = useSelector((state) => state.projects);
    const servicesFetching = useSelector((state) => state.services.isFetchingAll);

    const [selected, setSelected] = useState(value ?? undefined);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    const onChangeInner = useCallback((newSelected) => {
        if (!value) setSelected(newSelected);

        // Update the change handler bound to the component if one exists
        if (onChange) {
            onChange(newSelected);
        }
    }, [value, onChange, selected]);

    const selectTreeData = useMemo(() => projectItems.map(p => ({
        title: p.title,
        selectable: false,
        key: p.identifier,
        value: p.identifier,
        children: p.datasets.map(d => ({
            title: d.title,
            key: `${p.identifier}:${d.identifier}`,
            value: `${p.identifier}:${d.identifier}`,
            children: [
                {
                    title: `${p.title}:${d.title}:phenopacket`,
                    key: `${p.identifier}:${d.identifier}:phenopacket`,
                    value: `${p.identifier}:${d.identifier}:phenopacket`,
                },
                {
                    title: `${p.title}:${d.title}:experiment`,
                    key: `${p.identifier}:${d.identifier}:experiment`,
                    value: `${p.identifier}:${d.identifier}:experiment`,
                }
            ]
        })),
    })), [projectItems]);

    return <Spin spinning={servicesFetching || projectsFetching}>
        <TreeSelect
            style={style ?? {}}
            showSearch={true}
            // filterTreeNode={(v, n) => {
            //     const filter = v.toLocaleLowerCase().trim();
            //     if (filter === "") return true;
            //     return n.key.toLocaleLowerCase().includes(filter)
            //         || n.props.data.title.toLocaleLowerCase().includes(filter)
            //         || (n.props.data.dataType || "").toLocaleLowerCase().includes(filter);
            // }}
            onChange={onChangeInner}
            value={selected}
            treeData={selectTreeData}
            treeDefaultExpandAll={true}
        />
    </Spin>;
};

DatasetTreeSelect.propTypes = {
    style: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
};

export default DatasetTreeSelect;
