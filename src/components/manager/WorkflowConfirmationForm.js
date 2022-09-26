import React from "react";
import PropTypes from "prop-types";
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
    /* eslint-disable react/prop-types */
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
                                        <li key={v.toString()}>{v.toString()}</li>
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
            <Button type="primary" style={{ marginTop: "16px", float: "right" }} loading={loading} onClick={onClick}>
                <span style={{ textTransform: "capitalize" }}>{text}</span>
            </Button>
        ),
    };
    /* eslint-enable react/prop-types */

    fieldTypes[FIELD_OPTIONS.TEXT].propTypes = {
        text: PropTypes.string.isRequired,
    };
    fieldTypes[FIELD_OPTIONS.TAG].propTypes = {
        tag: PropTypes.string.isRequired,
    };
    fieldTypes[FIELD_OPTIONS.WORKFLOW].propTypes = {
        selectedWorkflow: PropTypes.object.isRequired,
    };
    fieldTypes[FIELD_OPTIONS.INPUTS].propTypes = {
        dataSource: PropTypes.array.isRequired,
    };
    fieldTypes[FIELD_OPTIONS.SUBMIT].propTypes = {
        loading: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired,
        text: PropTypes.string.isRequired,
    };

    return (
        <>
            {fields.map((field) =>
                field.type === FIELD_OPTIONS.SUBMIT ? (
                    <Item label={field.title} wrapperCol={FORM_BUTTON_COL}>
                        {fieldTypes[field.type](field.data)}
                    </Item>
                ) : (
                    <Item label={field.title}>{fieldTypes[field.type](field.data)}</Item>
                )
            )}
        </>
    );
};

WorkflowConfirmationForm.propTypes = {
    fields: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.oneOf(Object.values(FIELD_OPTIONS)),
            title: PropTypes.string,
            data: PropTypes.object,
        })
    ).isRequired,
};

export default WorkflowConfirmationForm;
