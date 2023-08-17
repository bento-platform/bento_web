import React, { useCallback, useState } from "react";
import { Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createProjectJsonSchemaIfPossible } from "../../../modules/metadata/actions";
import ProjectJsonSchemaForm from "./ProjectJsonSchemaForm";
import PropTypes from "prop-types";

const ProjectJsonSchemaModal = ({projectId, visible, onOk, onCancel}) => {
    const dispatch = useDispatch();
    const isFetchingExtraPropertiesSchemaTypes = useSelector((state) =>
        state.projects.isFetchingExtraPropertiesSchemaTypes);
    const extraPropertiesSchemaTypes = useSelector((state) => state.projects.extraPropertiesSchemaTypes);
    const isCreatingJsonSchema = useSelector((state) => state.projects.isCreatingJsonSchema);
    const [inputFormFields, setInputFormFields] = useState({});
    const [fileContent, setFileContent] = useState(null);

    const cancelReset = useCallback(() => {
        setInputFormFields({});
        setFileContent(null);
        onCancel();
    }, [onCancel]);

    const handleCreateSubmit = useCallback(() => {
        const payload = {
            "project": projectId,
            "schemaType": inputFormFields.schemaType.value,
            "required": inputFormFields.required.value,
            "jsonSchema": fileContent,
        };
        dispatch(createProjectJsonSchemaIfPossible(payload));
        setInputFormFields({});
        setFileContent(null);
        onOk();
    }, [projectId, inputFormFields, fileContent, onOk]);

    return (
        <Modal
            visible={visible}
            width={648}
            title="Create project level JSON schema"
            bodyStyle={{
                "overflowY": "auto",
                "maxHeight": 800,
            }}
            onCancel={cancelReset}
            footer={[
                <Button key="cancel" onClick={cancelReset}>Cancel</Button>,
                <Button key="create"
                        icon="plus"
                        type="primary"
                        onClick={handleCreateSubmit}
                        loading={isCreatingJsonSchema || isFetchingExtraPropertiesSchemaTypes}
                        disabled={!extraPropertiesSchemaTypes || Object.keys(
                            extraPropertiesSchemaTypes).length === 0}
                        >Create</Button>,
            ]}
        >
            <ProjectJsonSchemaForm
                schemaTypes={extraPropertiesSchemaTypes || {}}
                initialValues={{}}
                formValues={inputFormFields}
                onChange={setInputFormFields}
                fileContent={fileContent}
                setFileContent={setFileContent}
                />
        </Modal>
    );
};

ProjectJsonSchemaModal.propTypes = {
    projectId: PropTypes.string.isRequired,
    visible: PropTypes.bool,

    onOk: PropTypes.func,
    onCancel: PropTypes.func,
};

export default ProjectJsonSchemaModal;
