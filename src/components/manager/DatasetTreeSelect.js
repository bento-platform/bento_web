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
        setSelected(newSelected);
        // Update the change handler bound to the component if one exists
        if (onChange) {
            onChange(selected);
        }
    }, [value, onChange]);

    const selectTreeData = useMemo(() => projectItems.map(p => ({
        title: p.title,
        selectable: false,
        key: p.identifier,
        value: p.identifier,
        data: p,
        children: p.datasets.map(d => ({
            title: d.title,
            selectable: true,
            key: `${p.identifier}:${d.identifier}`,
            value: `${p.identifier}:${d.identifier}`,
            data: d,
            children: [
                {
                    titles: "phenopacket",
                    selectable: true,
                    key: `${p.identifier}:${d.identifier}:phenopacket`,
                    value: `${p.identifier}:${d.identifier}:phenopacket`,
                    data: "phenopacket",
                },
                {
                    titles: "experiments",
                    selectable: true,
                    key: `${p.identifier}:${d.identifier}:experiments`,
                    value: `${p.identifier}:${d.identifier}:experiments`,
                    data: "experiments",
                }
            ]
        })),
    })), [projectItems]);

    return <Spin spinning={servicesFetching || projectsFetching}>
        <TreeSelect
            style={style ?? {}}
            showSearch={true}
            filterTreeNode={(v, n) => {
                const filter = v.toLocaleLowerCase().trim();
                if (filter === "") return true;
                return n.key.toLocaleLowerCase().includes(filter)
                    || n.props.data.title.toLocaleLowerCase().includes(filter)
                    || (n.props.data.dataType || "").toLocaleLowerCase().includes(filter);
            }}
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
