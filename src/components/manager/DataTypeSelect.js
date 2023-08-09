import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Select, Spin } from "antd";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const DataTypeSelect = ({value, workflows, onChange}) => {
    const [selected, setSelected] = useState(value ?? undefined);
    const servicesFetching = useSelector((state) => state.services.isFetchingAll);
    const workflowsFetching = useSelector((state) => state.serviceWorkflows.isFetchingAll);
    
    useEffect(() => {
        setSelected(value);
    }, [value])

    const onChangeInner = useCallback((newSelected) => {
        if (!value) setSelected(newSelected);
        if (onChange) {
            onChange(newSelected);
        }
    }, [value, onChange, selected]);

    const options = useMemo(() => {
        if (Array.isArray(workflows)) {
            const dataTypes = new Set(workflows.map((w) => w.data_type));
            return Array.from(dataTypes).map((dt) =>
                <Select.Option value={dt} key={dt}>
                    {dt}
                </Select.Option>
            )
        }
        return [];
    }, [workflows]);

    return (
        <Spin spinning={servicesFetching || workflowsFetching}>
            <Select value={selected} onChange={onChangeInner}>
                {options}
            </Select>
        </Spin>
        
    );
};

DataTypeSelect.propTypes = {
    workflows: PropTypes.array,
    onChange: PropTypes.func,
    value: PropTypes.string
};

export default DataTypeSelect;
