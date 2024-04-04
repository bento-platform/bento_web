import React, { Component } from "react";
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

class Project extends Component {
    static getDerivedStateFromProps(nextProps) {
        // TODO: Want to warn the user if the description has changed and they're editing...
        if ("value" in nextProps) {
            return {
                ...(nextProps.value || {}),
                data_use: simpleDeepCopy((nextProps.value || {}).data_use || INITIAL_DATA_USE_VALUE),
            };
        }
        return null;
    }

    handleCancelEdit() {
        this._onCancelEdit();
    }

    handleContentTabClick(tab) {
        this.setState({ selectedKey: tab });
    }

    constructor(props) {
        super(props);

        this._onCancelEdit = props.onCancelEdit || nop;
        this._onSave = props.onSave || nop;

        this.editingForm = React.createRef();

        this.handleCancelEdit = this.handleCancelEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleContentTabClick = this.handleContentTabClick.bind(this);

        const value = props.value || {};
        this.state = {
            identifier: value.identifier || null,
            title: value.title || "",
            description: value.description || "",
            datasets: value.datasets || [],
            project_schemas: value.project_schemas || [],
            selectedKey: SUB_TAB_KEYS.DATASETS,
        };
    }

    handleSave() {
        const form = this.editingForm.current;
        if (!form) return;
        form.validateFields().then((values) => {
            // Don't save datasets since it's a related set.
            this._onSave({
                identifier: this.state.identifier,
                title: values.title || this.state.title,
                description: values.description || this.state.description,
                data_use: values.data_use || this.state.data_use,
            });
        }).catch((err) => {
            console.error(err);
        });
    }

    render() {
        return <div>
            <div style={{position: "absolute", top: "24px", right: "24px"}}>
                {this.props.editing ? (
                    <>
                        <Button type="primary"
                                icon={<CheckOutlined />}
                                loading={this.props.saving}
                                onClick={() => this.handleSave()}>Save</Button>
                        <Button icon={<CloseOutlined />}
                                style={{marginLeft: "10px"}}
                                disabled={this.props.saving}
                                onClick={() => this.handleCancelEdit()}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <Button icon={<EditOutlined />} onClick={() => (this.props.onEdit || nop)()}>Edit</Button>
                        <Button danger={true}
                                icon={<DeleteOutlined />}
                                style={{marginLeft: "10px"}}
                                onClick={() => (this.props.onDelete || nop)()}>Delete</Button>
                    </>
                )}
            </div>
            {this.props.editing ? (
                <ProjectForm
                    style={{maxWidth: "600px"}}
                    initialValues={{
                        title: this.state.title,
                        description: this.state.description,
                        data_use: this.state.data_use,
                    }}
                    formRef={this.editingForm}
                />
            ) : (
                <>
                    <Typography.Title level={2} style={{ marginTop: 0 }}>
                        {this.state.title}
                    </Typography.Title>
                    {this.state.description.split("\n").map((p, i) =>
                        <Typography.Paragraph key={i} style={{maxWidth: "600px"}}>{p}</Typography.Paragraph>)}
                </>
            )}

            <Tabs
                onChange={this.handleContentTabClick}
                activeKey={this.state.selectedKey}
                items={SUB_TAB_ITEMS}
                size="large"
            />

            {this.state.selectedKey === SUB_TAB_KEYS.DATASETS
                ? <>
                    <Typography.Title level={3} style={{ marginTop: "0.6em" }}>
                        Datasets
                        <div style={{ float: "right" }}>
                            <Button icon={<PlusOutlined />}
                                    style={{ verticalAlign: "top" }}
                                    onClick={() => (this.props.onAddDataset || nop)()}>
                                Add Dataset
                            </Button>
                        </div>
                    </Typography.Title>
                    {(this.state.datasets || []).length > 0
                        ? (
                            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                                {this.state.datasets.sort((d1, d2) => d1.title.localeCompare(d2.title)).map(d => (
                                    <Col span={24} key={d.identifier}>
                                        <Dataset
                                            key={d.identifier}
                                            mode="private"
                                            project={this.props.value}
                                            value={d}
                                            onEdit={() => (this.props.onEditDataset || nop)(d)}
                                        />
                                    </Col>
                                ))}
                            </Space>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Datasets">
                                <Button icon={<PlusOutlined />} onClick={() => (this.props.onAddDataset || nop)()}>
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
                                    onClick={this.props.onAddJsonSchema}>
                                Add JSON schema
                            </Button>
                        </div>
                    </Typography.Title>
                    {this.state.project_schemas.length > 0
                        ? this.state.project_schemas.map(pjs =>
                            <Row gutter={[0, 16]} key={pjs["id"]}>
                                <Col span={24}>
                                    <ProjectJsonSchema projectSchema={pjs} />
                                </Col>
                            </Row>,
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No project JSON schemas">
                                <Button icon={<PlusOutlined />} onClick={this.props.onAddJsonSchema}>
                                    Add JSON schema
                                </Button>
                            </Empty>
                        )

                    }

                </>
            }

        </div>;
    }
}

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
