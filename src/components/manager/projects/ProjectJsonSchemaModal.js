import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Button, Form, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { createProjectJsonSchemaIfPossible } from "@/modules/metadata/actions";
import ProjectJsonSchemaForm from "./ProjectJsonSchemaForm";

const ProjectJsonSchemaModal = ({ projectId, open, onOk, onCancel }) => {
    const dispatch = useDispatch();

    const isFetchingExtraPropertiesSchemaTypes = useSelector((state) =>
        state.projects.isFetchingExtraPropertiesSchemaTypes);
    const extraPropertiesSchemaTypes = useSelector((state) => state.projects.extraPropertiesSchemaTypes);
    const isCreatingJsonSchema = useSelector((state) => state.projects.isCreatingJsonSchema);

    const [form] = Form.useForm();

    const cancelReset = useCallback(() => {
        form.resetFields();
        onCancel();
    }, [form, onCancel]);

    const handleCreateSubmit = useCallback(() => {

        form.validateFields().then((values) => {
            console.log(values);

            const payload = {
                "project": projectId,
                "schemaType": values.schemaType,
                "required": values.required,
                "jsonSchema": values.jsonSchema,
            };
            dispatch(createProjectJsonSchemaIfPossible(payload));

            form.resetFields();
            onOk();
        }).catch((err) => console.error(err));
    }, [projectId, onOk]);

    return (
        <Modal
            open={open}
            width={648}
            title="Create project level JSON schema"
            styles={{
                body: {
                    overflowY: "auto",
                    maxHeight: 800,
                },
            }}
            onCancel={cancelReset}
            footer={[
                <Button key="cancel" onClick={cancelReset}>Cancel</Button>,
                <Button
                    key="create"
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={handleCreateSubmit}
                    loading={isCreatingJsonSchema || isFetchingExtraPropertiesSchemaTypes}
                    disabled={!extraPropertiesSchemaTypes || Object.keys(extraPropertiesSchemaTypes).length === 0}
                >Create</Button>,
            ]}
        >
            <ProjectJsonSchemaForm form={form} schemaTypes={extraPropertiesSchemaTypes || {}} initialValues={{}} />
        </Modal>
    );
};

ProjectJsonSchemaModal.propTypes = {
    projectId: PropTypes.string.isRequired,
    open: PropTypes.bool,

    onOk: PropTypes.func,
    onCancel: PropTypes.func,
};

export default ProjectJsonSchemaModal;
