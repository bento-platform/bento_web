import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Col, Empty, Menu, Row, Typography } from "antd";
import Dataset from "../../datasets/Dataset";
import ProjectForm from "./ProjectForm";
import { INITIAL_DATA_USE_VALUE } from "../../../duo";
import { nop, simpleDeepCopy } from "../../../utils/misc";
import { projectPropTypesShape } from "../../../propTypes";
import ProjectJsonSchema from "./ProjectJsonSchema";

const SUB_TAB_KEYS = {
    DATASETS: "project-datasets",
    EXTRA_PROPERTIES: "project-json-schemas"
};

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

    handleContentTabClick(event) {
        this.setState({ selectedKey: event.key });
    }

    constructor(props) {
        super(props);

        this._onCancelEdit = props.onCancelEdit || nop;
        this._onSave = props.onSave || nop;

        this.editingForm = null;

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
        this.editingForm.validateFields((err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            // Don't save datasets since it's a related set.
            this._onSave({
                identifier: this.state.identifier,
                title: values.title || this.state.title,
                description: values.description || this.state.description,
                data_use: values.data_use || this.state.data_use,
            });
        });
    }

    render() {
        return <div>
            <div style={{position: "absolute", top: "24px", right: "24px"}}>
                {this.props.editing ? (
                    <>
                        <Button type="primary"
                                icon="check"
                                loading={this.props.saving}
                                onClick={() => this.handleSave()}>Save</Button>
                        <Button icon="close"
                                style={{marginLeft: "10px"}}
                                disabled={this.props.saving}
                                onClick={() => this.handleCancelEdit()}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <Button icon="edit" onClick={() => (this.props.onEdit || nop)()}>Edit</Button>
                        <Button type="danger" icon="delete"
                                style={{marginLeft: "10px"}}
                                onClick={() => (this.props.onDelete || nop)()}>Delete</Button>
                    </>
                )}
            </div>
            {this.props.editing ? (
                <ProjectForm style={{maxWidth: "600px"}}
                             initialValue={{
                                 title: this.state.title,
                                 description: this.state.description,
                                 data_use: this.state.data_use,
                             }}
                             ref={form => this.editingForm = form} />
            ) : (
                <>
                    <Typography.Title level={2}>
                        {this.state.title}
                    </Typography.Title>
                    {this.state.description.split("\n").map((p, i) =>
                        <Typography.Paragraph key={i} style={{maxWidth: "600px"}}>{p}</Typography.Paragraph>)}
                </>
            )}

            <Menu mode="horizontal" onClick={this.handleContentTabClick} selectedKeys={this.state.selectedKey}>
                <Menu.Item key={SUB_TAB_KEYS.DATASETS}>Datasets</Menu.Item>
                <Menu.Item key={SUB_TAB_KEYS.EXTRA_PROPERTIES}>Extra Properties</Menu.Item>
            </Menu>

            {this.state.selectedKey === SUB_TAB_KEYS.DATASETS
                ? <>
                    <Typography.Title level={3} style={{ marginTop: "1.2em" }}>
                        Datasets
                        <div style={{ float: "right" }}>
                            <Button icon="plus"
                                    style={{ verticalAlign: "top" }}
                                    onClick={() => (this.props.onAddDataset || nop)()}>
                                Add Dataset
                            </Button>
                        </div>
                    </Typography.Title>
                    {(this.state.datasets || []).length > 0
                        ? this.state.datasets.sort((d1, d2) => d1.title.localeCompare(d2.title)).map(d =>
                            <Row gutter={[0, 16]} key={d.identifier}>
                                <Col span={24}>
                                    <Dataset
                                        key={d.identifier}
                                        mode="private"
                                        project={this.props.value}
                                        value={{
                                            ...d,
                                            tables: this.props.tables.filter(t => t.dataset === d.identifier),
                                        }}
                                        strayTables={this.props.strayTables}
                                        onEdit={() => (this.props.onEditDataset || nop)(d)}
                                        onTableIngest={this.props.onTableIngest || nop}
                                    />
                                </Col>
                            </Row>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Datasets">
                                <Button icon="plus" onClick={() => (this.props.onAddDataset || nop)()}>
                                    Add Dataset
                                </Button>
                            </Empty>
                        )}
                </>
                : <>
                    <Typography.Title level={3} style={{ marginTop: "1.2em" }}>
                        Extra Properties JSON schemas
                        <div style={{ float: "right" }}>
                            <Button icon="plus"
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
                            </Row>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No project JSON schemas">
                                <Button icon="plus" onClick={this.props.onAddJsonSchema}>
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
    tables: PropTypes.arrayOf(PropTypes.object),  // TODO: shape
    strayTables: PropTypes.arrayOf(PropTypes.object),  // TODO: shape (this is currently heterogeneous)

    editing: PropTypes.bool,
    saving: PropTypes.bool,

    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onCancelEdit: PropTypes.func,
    onSave: PropTypes.func,
    onAddDataset: PropTypes.func,
    onEditDataset: PropTypes.func,
    onAddJsonSchema: PropTypes.func,

    onTableIngest: PropTypes.func,
};

export default Project;
