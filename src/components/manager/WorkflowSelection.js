import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Col, Form, Input, List, Row, Select, Skeleton, Spin } from "antd";
import WorkflowListItem from "./WorkflowListItem";

import { workflowsStateToPropsMixin, workflowTypePropType } from "../../propTypes";
import { FORM_LABEL_COL, FORM_WRAPPER_COL } from "./workflowCommon";

const filterValuesPropType = PropTypes.shape({
    text: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
});

const WorkflowFilter = ({ loading, tags, value, onChange }) => {
    const onChangeText = useCallback(e => onChange({ ...value, text: e.target.value }), [onChange]);
    const onChangeTags = useCallback(tags => onChange({ ...value, tags }), [onChange]);

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
};

const WorkflowSelection = ({ workflowType, initialFilterValues, handleWorkflowClick }) => {
    const { workflows, workflowsLoading } = useSelector(workflowsStateToPropsMixin);

    const workflowsOfType = workflows[workflowType] ?? [];
    const tags = useMemo(
        () => Array.from(new Set(workflowsOfType.map(w => w.data_type))),
        [workflowsOfType],
    );

    const [filterValues, setFilterValues] = useState({
        text: "",
        tags: [],
    });

    useEffect(() => {
        if (filterValues.text === "" && !filterValues.tags.length) {
            setFilterValues(initialFilterValues);
        }
    }, [initialFilterValues]);

    /** @type {React.ReactNode[]} */
    const workflowItems = useMemo(
        () => {
            const ftLower = filterValues.text.toLowerCase().trim();
            const ftTags = filterValues.tags;

            return workflowsOfType
                .filter(w =>
                    (
                        !ftLower ||
                        w.name.toLowerCase().includes(ftLower) ||
                        w.description.toLowerCase().includes(ftLower) ||
                        w.data_type.includes(ftLower)
                    ) && (ftTags.length === 0 || ftTags.includes(w.data_type))
                )  // TODO: tags too, properly
                .map(w =>
                    <WorkflowListItem
                        key={w.id}
                        workflow={w}
                        selectable={true}
                        onClick={() => handleWorkflowClick(w)}
                    />,
                )
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
