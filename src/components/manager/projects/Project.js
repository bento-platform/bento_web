import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Button, Col, Empty, Row, Typography } from "antd";

import Dataset from "../../datasets/Dataset";
import ProjectForm from "./ProjectForm";

import { INITIAL_DATA_USE_VALUE } from "../../../duo";
import { nop, simpleDeepCopy } from "../../../utils/misc";
import { projectPropTypesShape } from "../../../propTypes";

const Project = ({
    value,
    tables,
    strayTables,
    editing,
    saving,
    onDelete,
    onEdit,
    onCancelEdit,
    onSave,
    onAddDataset,
    onEditDataset,
    onTableIngest,
}) => {
    const _onCancelEdit = onCancelEdit || nop;
    const _onSave = onSave || nop;

    let editingForm = null;

    value = value || {};

    const [state, setState] = useState({
        identifier: value.identifier || null,
        title: value.title || "",
        description: value.description || "",
        datasets: value.datasets || [],
    });

    useEffect(() => {
        setState({
            ...state,
            ...value,
            data_use: simpleDeepCopy(value?.data_use || INITIAL_DATA_USE_VALUE),
        });
    }, [value]);

    const handleCancelEdit = () => {
        _onCancelEdit();
    };

    const handleSave = () => {
        editingForm.validateFields((err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            // Don't save datasets since it's a related set.
            _onSave({
                identifier: state.identifier,
                title: values.title || state.title,
                description: values.description || state.description,
                data_use: values.data_use || state.data_use,
            });
        });
    };

    return (
        <div>
            <div style={{ position: "absolute", top: "24px", right: "24px" }}>
                {editing ? (
                    <>
                        <Button
                            type="primary"
                            icon="check"
                            loading={saving}
                            onClick={() => handleSave()}
                        >
                            Save
                        </Button>
                        <Button
                            icon="close"
                            style={{ marginLeft: "10px" }}
                            disabled={saving}
                            onClick={() => handleCancelEdit()}
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button icon="edit" onClick={() => (onEdit || nop)()}>
                            Edit
                        </Button>
                        <Button
                            type="danger"
                            icon="delete"
                            style={{ marginLeft: "10px" }}
                            onClick={() => (onDelete || nop)()}
                        >
                            Delete
                        </Button>
                    </>
                )}
            </div>
            {editing ? (
                <ProjectForm
                    style={{ maxWidth: "600px" }}
                    initialValue={{
                        title: state.title,
                        description: state.description,
                        data_use: state.data_use,
                    }}
                    ref={(form) => (editingForm = form)}
                />
            ) : (
                <>
                    <Typography.Title level={2}>{state.title}</Typography.Title>
                    {state.description.split("\n").map((p, i) => (
                        <Typography.Paragraph
                            key={i}
                            style={{ maxWidth: "600px" }}
                        >
                            {p}
                        </Typography.Paragraph>
                    ))}
                </>
            )}

            <Typography.Title level={3} style={{ marginTop: "1.2em" }}>
                Datasets
                <div style={{ float: "right" }}>
                    <Button
                        icon="plus"
                        style={{ verticalAlign: "top" }}
                        onClick={() => (onAddDataset || nop)()}
                    >
                        Add Dataset
                    </Button>
                </div>
            </Typography.Title>
            {(state.datasets || []).length > 0 ? (
                state.datasets
                    .sort((d1, d2) => d1.title.localeCompare(d2.title))
                    .map((d) => (
                        <Row gutter={[0, 16]} key={d.identifier}>
                            <Col span={24}>
                                <Dataset
                                    key={d.identifier}
                                    mode="private"
                                    project={value}
                                    value={{
                                        ...d,
                                        tables: tables.filter(
                                            (t) => t.dataset === d.identifier
                                        ),
                                    }}
                                    strayTables={strayTables}
                                    onEdit={() => (onEditDataset || nop)(d)}
                                    onTableIngest={onTableIngest || nop}
                                />
                            </Col>
                        </Row>
                    ))
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No Datasets"
                >
                    <Button icon="plus" onClick={() => (onAddDataset || nop)()}>
                        Add Dataset
                    </Button>
                </Empty>
            )}
        </div>
    );
};

Project.propTypes = {
    value: projectPropTypesShape,
    tables: PropTypes.arrayOf(PropTypes.object), // TODO: shape
    strayTables: PropTypes.arrayOf(PropTypes.object), // TODO: shape (this is currently heterogeneous)

    editing: PropTypes.bool,
    saving: PropTypes.bool,

    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onCancelEdit: PropTypes.func,
    onSave: PropTypes.func,
    onAddDataset: PropTypes.func,
    onEditDataset: PropTypes.func,

    onTableIngest: PropTypes.func,
};

export default Project;
