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
        if (onChange) {
            const [project, dataset] = newSelected.split(":");
            onChange(project, dataset);
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
        })),
    })), [projectItems]);

    return <Spin spinning={servicesFetching || projectsFetching}>
        <TreeSelect
            style={style ?? {}}
            showSearch={true}
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
