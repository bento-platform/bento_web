import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Select, Spin } from "antd";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const DataTypeSelect = ({value, workflows, onChange}) => {
    const [selected, setSelected] = useState(value ?? undefined);
    const servicesFetching = useSelector((state) => state.services.isFetchingAll);
    const workflowsFetching = useSelector((state) => state.serviceWorkflows.isFetchingAll);
    const {
        itemsByID: dataTypes,
        isFetchingAll: isFetchingDataTypes,
    } = useSelector((state) => state.serviceDataTypes);

    const labels = useMemo(() => {
        if (!dataTypes) return {};
        return Object.fromEntries(
            Object.values(dataTypes).map(dt => [dt.id, dt.label]),
        );
    }, dataTypes);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    const onChangeInner = useCallback((newSelected) => {
        if (!value) setSelected(newSelected);
        if (onChange) {
            onChange(newSelected);
        }
    }, [value, onChange]);

    const options = useMemo(() => {
        if (!Array.isArray(workflows)) {
            return [];
        }
        const dataTypes = new Set(workflows.map((w) => w.data_type));
        return Array.from(dataTypes)
            // filter out workflow types for which we have no labels (mcode)
            .filter(dt => dt in labels)
            .map((dt) =>
                <Select.Option value={dt} key={dt}>
                    {labels[dt]} ({<span style={{fontFamily: "monospace"}}>{dt}</span>})
                </Select.Option>,
            );
    }, [workflows, dataTypes, labels]);

    return (
        <Spin spinning={servicesFetching || workflowsFetching || isFetchingDataTypes}>
            <Select value={selected} onChange={onChangeInner}>
                {options}
            </Select>
        </Spin>
    );
};

DataTypeSelect.propTypes = {
    workflows: PropTypes.array,
    onChange: PropTypes.func,
    value: PropTypes.string,
};

export default DataTypeSelect;
