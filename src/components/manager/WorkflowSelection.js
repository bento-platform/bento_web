import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Col, Form, Input, List, Row, Select, Skeleton, Spin } from "antd";
import WorkflowListItem from "./WorkflowListItem";

import { useWorkflows } from "@/hooks";
import { workflowTypePropType } from "@/propTypes";
import { FORM_LABEL_COL, FORM_WRAPPER_COL } from "./workflowCommon";

const filterValuesPropType = PropTypes.shape({
    text: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
});

const WorkflowFilter = ({ loading, tags, value, onChange }) => {
    const onChangeText = useCallback(e => onChange({ ...value, text: e.target.value }), [value, onChange]);
    const onChangeTags = useCallback(tags => onChange({ ...value, tags }), [value, onChange]);

    return <Row gutter={24}>
        <Col md={24} lg={12}>
            <Input.Search
                disabled={loading}
                loading={loading}
                placeholder="Filter workflows..."
                allowClear={true}
                value={value.text}
                onChange={onChangeText}
            />
        </Col>
        <Col md={24} lg={12}>
            <Select
                mode="multiple"
                disabled={loading}
                loading={loading}
                placeholder="Select workflow tags..."
                value={value.tags}
                onChange={onChangeTags}
            >
                {(tags ?? []).map(t => <Select.Option key={t}>{t}</Select.Option>)}
            </Select>
        </Col>
    </Row>;
};
WorkflowFilter.propTypes = {
    loading: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
    value: filterValuesPropType,
    onChange: PropTypes.func,
};

const INITIAL_FILTER_STATE = {
    text: "",
    tags: [],
};

const WorkflowSelection = ({ workflowType, initialFilterValues, handleWorkflowClick }) => {
    const { workflowsByType, workflowsLoading } = useWorkflows();

    const workflowsOfType = workflowsByType[workflowType] ?? [];
    const tags = useMemo(
        () => Array.from(new Set(workflowsOfType.items.flatMap(w => [
            ...(w.data_type ? [w.data_type] : []),
            ...(w.tags ?? []),
        ]))),
        [workflowsOfType],
    );

    const [filterValues, setFilterValues] = useState(INITIAL_FILTER_STATE);

    useEffect(() => {
        if (filterValues.text === "" && !filterValues.tags.length && initialFilterValues) {
            setFilterValues({...INITIAL_FILTER_STATE, filterValues});
        }
    }, [initialFilterValues]);

    /** @type {React.ReactNode[]} */
    const workflowItems = useMemo(
        () => {
            const ftLower = filterValues.text.toLowerCase().trim();
            const ftTags = filterValues.tags;

            return workflowsOfType
                .items
                .filter(w => {
                    const wTags = new Set(w.tags ?? []);
                    return (
                        !ftLower ||
                        w.name.toLowerCase().includes(ftLower) ||
                        w.description.toLowerCase().includes(ftLower) ||
                        (w.data_type && w.data_type.includes(ftLower)) ||
                        wTags.has(ftLower)
                    ) && (
                        ftTags.length === 0 ||
                        ftTags.reduce((acc, t) => acc && wTags.has(t), true)
                    );
                })
                .map(w =>
                    <WorkflowListItem
                        key={w.id}
                        workflow={w}
                        selectable={true}
                        onClick={() => handleWorkflowClick(w)}
                    />,
                );
        },
        [workflowsOfType, filterValues],
    );

    return <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
        <Form.Item label="Search">
            <WorkflowFilter loading={workflowsLoading} tags={tags} value={filterValues} onChange={setFilterValues} />
        </Form.Item>
        <Form.Item label="Workflows">
            <Spin spinning={workflowsLoading}>
                {workflowsLoading
                    ? <Skeleton />
                    : <List itemLayout="vertical">{workflowItems}</List>}
            </Spin>
        </Form.Item>
    </Form>;
};
WorkflowSelection.propTypes = {
    workflowType: workflowTypePropType.isRequired,
    initialFilterValues: filterValuesPropType,
    handleWorkflowClick: PropTypes.func,
};

export default WorkflowSelection;
