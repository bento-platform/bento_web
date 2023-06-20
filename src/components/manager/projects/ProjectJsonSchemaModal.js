import React, { useCallback, useState } from "react";
import { Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createProjectJsonSchemaIfPossible } from "../../../modules/metadata/actions";
import ProjectJsonSchemaForm from "./ProjectJsonSchemaForm";
import PropTypes from "prop-types";

const ProjectJsonSchemaModal = ({projectId, visible, onOk, onCancel}) => {
    const dispatch = useDispatch();
    const isCreatingJsonSchema = useSelector((state) => state.projects.isCreatingJsonSchema);
    const extraPropertiesSchemaTypes = useSelector((state) => state.projects.extraPropertiesSchemaTypes);
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
                        disabled={!extraPropertiesSchemaTypes || Object.keys(extraPropertiesSchemaTypes).length === 0}
                        loading={isCreatingJsonSchema}>Create</Button>,
            ]}
        >
            {Object.keys(extraPropertiesSchemaTypes).length === 0 ?
                <>There are not schema types available.</> :
                <ProjectJsonSchemaForm
                    schemaTypes={extraPropertiesSchemaTypes}
                    initialValues={{}}
                    formValues={inputFormFields}
                    onChange={setInputFormFields}
                    fileContent={fileContent}
                    setFileContent={setFileContent}
                />
            }
        </Modal>
    );
};

ProjectJsonSchemaModal.propTypes = {
    projectId: PropTypes.string.isRequired,
    visible: PropTypes.bool,

    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    extraPropertiesSchemaTypes: PropTypes.object,
};

export default ProjectJsonSchemaModal;
