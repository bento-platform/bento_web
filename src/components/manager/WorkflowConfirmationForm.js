import React from "react";
import { Button, Form, List, Table, Tag } from "antd";
import WorkflowListItem from "./WorkflowListItem";
import { FORM_BUTTON_COL } from "./ingestion";
import { EM_DASH } from "../../constants";
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
                {<WorkflowListItem workflow={selectedWorkflow} />}
            </List>
        ),
        [FIELD_OPTIONS.INPUTS]: ({ dataSource }) => (
            <Table
                size="small"
                bordered={true}
                showHeader={false}
                pagination={false}
                columns={[
                    {
                        title: "ID",
                        dataIndex: "id",
                        render: (iID) => (
                            <span
                                style={{
                                    fontWeight: "bold",
                                    marginRight: "0.5em",
                                }}
                            >
                                {iID}
                            </span>
                        ),
                    },
                    {
                        title: "Value",
                        dataIndex: "value",
                        render: (value) =>
                            value === undefined ? (
                                EM_DASH
                            ) : value instanceof Array ? (
                                <ul>
                                    {value.map((v) => (
                                        <li key={v.toString()}>
                                            {v.toString()}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                value.toString()
                            ),
                    },
                ]}
                rowKey="id"
                dataSource={dataSource}
            />
        ),
        [FIELD_OPTIONS.SUBMIT]: ({ loading, onClick, text }) => (
            <Button
                type="primary"
                style={{ marginTop: "16px", float: "right" }}
                loading={loading}
                onClick={onClick}
            >
                <span style={{ textTransform: "capitalize" }}>{text}</span>
            </Button>
        ),
    };

    return (
        <>
            {fields.map((field) =>
                field.type === FIELD_OPTIONS.SUBMIT ? (
                    <Item label={field.title} wrapperCol={FORM_BUTTON_COL}>
                        {fieldTypes[field.type](field.data)}
                    </Item>
                ) : (
                    <Item label={field.title}>
                        {fieldTypes[field.type](field.data)}
                    </Item>
                )
            )}
        </>
    );
};

export default WorkflowConfirmationForm;
