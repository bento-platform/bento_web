import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { Button, Col, Empty, Row, Space, Tabs, Typography } from "antd";
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import Dataset from "../../datasets/Dataset";
import ProjectForm from "./ProjectForm";
import { INITIAL_DATA_USE_VALUE } from "@/duo";
import { nop, simpleDeepCopy } from "@/utils/misc";
import { projectPropTypesShape } from "@/propTypes";
import ProjectJsonSchema from "./ProjectJsonSchema";

const SUB_TAB_KEYS = {
    DATASETS: "project-datasets",
    EXTRA_PROPERTIES: "project-json-schemas",
};
const SUB_TAB_ITEMS = [
    { key: SUB_TAB_KEYS.DATASETS, label: "Datasets" },
    { key: SUB_TAB_KEYS.EXTRA_PROPERTIES, label: "Extra Properties" },
];

const Project = ({
    value,
    saving,
    editing,
    onAddDataset,
    onEditDataset,
    onAddJsonSchema,
    onEdit,
    onCancelEdit,
    onSave,
    onDelete,
}) => {
    const [projectState, setProjectState] = useState({
        identifier: value.identifier || null,
        title: value.title || "",
        description: value.description || "",
        datasets: value.datasets || [],
        project_schemas: value.project_schemas || [],
    });

    const editingForm = useRef();

    const [selectedKey, setSelectedKey] = useState(SUB_TAB_KEYS.DATASETS);

    useEffect(() => {
        if (value) {
            setProjectState({
                ...projectState,
                ...value,
                data_use: simpleDeepCopy(value.data_use || INITIAL_DATA_USE_VALUE),
            });
        }
    }, [value]);

    const handleSave = useCallback(() => {
        const form = editingForm.current;
        if (!form) return;
        form.validateFields().then((values) => {
            // Don't save datasets since it's a related set.
            onSave({
                identifier: projectState.identifier,
                title: values.title || projectState.title,
                description: values.description || projectState.description,
                data_use: values.data_use || projectState.data_use,
            });
        }).catch((err) => {
            console.error(err);
        });
    }, [onSave, projectState]);

    return (
        <div>
            <div style={{ position: "absolute", top: "24px", right: "24px" }}>
                {editing ? (
                    <>
                        <Button type="primary"
                                icon={<CheckOutlined />}
                                loading={saving}
                                onClick={() => handleSave()}>Save</Button>
                        <Button icon={<CloseOutlined />}
                                style={{ marginLeft: "10px" }}
                                disabled={saving}
                                onClick={() => onCancelEdit()}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <Button icon={<EditOutlined />} onClick={() => (onEdit || nop)()}>Edit</Button>
                        <Button danger={true}
                                icon={<DeleteOutlined />}
                                style={{ marginLeft: "10px" }}
                                onClick={() => (onDelete || nop)()}>Delete</Button>
                    </>
                )}
            </div>
            {editing ? (
                <ProjectForm
                    style={{ maxWidth: "600px" }}
                    initialValues={{
                        title: projectState.title,
                        description: projectState.description,
                        data_use: projectState.data_use,
                    }}
                    formRef={editingForm}
                />
            ) : (
                <>
                    <Typography.Title level={2} style={{ marginTop: 0 }}>
                        {projectState.title}
                    </Typography.Title>
                    {projectState.description.split("\n").map((p, i) =>
                        <Typography.Paragraph key={i} style={{ maxWidth: "600px" }}>{p}</Typography.Paragraph>)}
                </>
            )}

            <Tabs
                onChange={(tab) => setSelectedKey(tab)}
                activeKey={selectedKey}
                items={SUB_TAB_ITEMS}
                size="large"
            />

            {selectedKey === SUB_TAB_KEYS.DATASETS
                ? <>
                    <Typography.Title level={3} style={{ marginTop: "0.6em" }}>
                        Datasets
                        <div style={{ float: "right" }}>
                            <Button icon={<PlusOutlined />}
                                    style={{ verticalAlign: "top" }}
                                    onClick={() => (onAddDataset || nop)()}>
                                Add Dataset
                            </Button>
                        </div>
                    </Typography.Title>
                    {(projectState.datasets || []).length > 0
                        ? (
                            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                                {projectState.datasets.sort((d1, d2) => d1.title.localeCompare(d2.title)).map((d) => (
                                    <Col span={24} key={d.identifier}>
                                        <Dataset
                                            key={d.identifier}
                                            mode="private"
                                            project={value}
                                            value={d}
                                            onEdit={() => (onEditDataset || nop)(d)}
                                        />
                                    </Col>
                                ))}
                            </Space>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Datasets">
                                <Button icon={<PlusOutlined />} onClick={() => (onAddDataset || nop)()}>
                                    Add Dataset
                                </Button>
                            </Empty>
                        )}
                </>
                : <>
                    <Typography.Title level={3} style={{ marginTop: "0.6em" }}>
                        Extra Properties JSON schemas
                        <div style={{ float: "right" }}>
                            <Button icon={<PlusOutlined />}
                                    style={{ verticalAlign: "top" }}
                                    onClick={onAddJsonSchema}>
                                Add JSON schema
                            </Button>
                        </div>
                    </Typography.Title>
                    {projectState.project_schemas.length > 0
                        ? projectState.project_schemas.map(pjs =>
                            <Row gutter={[0, 16]} key={pjs["id"]}>
                                <Col span={24}>
                                    <ProjectJsonSchema projectSchema={pjs} />
                                </Col>
                            </Row>,
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No project JSON schemas">
                                <Button icon={<PlusOutlined />} onClick={onAddJsonSchema}>
                                    Add JSON schema
                                </Button>
                            </Empty>
                        )

                    }

                </>
            }
        </div>
    );
};

Project.propTypes = {
    value: projectPropTypesShape,

    editing: PropTypes.bool,
    saving: PropTypes.bool,

    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onCancelEdit: PropTypes.func,
    onSave: PropTypes.func,
    onAddDataset: PropTypes.func,
    onEditDataset: PropTypes.func,
    onAddJsonSchema: PropTypes.func,
};

export default Project;
