import React from "react";
import { Button, Form, List, Table, Tag } from "antd";
import WorkflowListItem from "./WorkflowListItem";
import {FORM_BUTTON_COL} from "./ingestion";
const { Item } = Form;

export const FIELD_OPTIONS = {
    TEXT: "text",
    TAG: "tag",
    WORKFLOW: "workflow",
    INPUTS: "inputs",
    SUBMIT: "submit",
};

const WorkflowConfirmationForm = ({ fields }) => {
    const fieldTypes = {
        [FIELD_OPTIONS.TEXT]: ({ text }) => text,
        [FIELD_OPTIONS.TAG]: ({ tag }) => <Tag>{tag}</Tag>,
        [FIELD_OPTIONS.WORKFLOW]: ({ selectedWorkflow }) => (
            <List itemLayout="vertical" style={{ marginBottom: "14px" }}>
                <WorkflowListItem workflow={selectedWorkflow} />
            </List>
        ),
        [FIELD_OPTIONS.INPUTS]: ({ columns, dataSource }) => (
            <Table
                size="small"
                bordered={true}
                showHeader={false}
                pagination={false}
                columns={columns}
                rowKey="id"
                dataSource={dataSource}
            />
        ),
        [FIELD_OPTIONS.SUBMIT]: ({ loading, onClick, text }) => (
            <div wrapperCol={FORM_BUTTON_COL}>
                <Button
                    type="primary"
                    style={{ marginTop: "16px", float: "right" }}
                    loading={loading}
                    onClick={onClick}
                >
                    <span style={{ textTransform: "capitalize" }}>{text}</span>
                </Button>
            </div>
        ),
    };

    return (
        <>
            {fields.map((field) => (
                <Item label={field.title}>
                    {fieldTypes[field.type](field.data)}
                </Item>
            ))}
        </>
    );
};

export default WorkflowConfirmationForm;
