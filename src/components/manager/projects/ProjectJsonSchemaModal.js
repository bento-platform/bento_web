import React, { useCallback, useState } from "react";
import { Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createProjectJsonSchemaIfPossible } from "../../../modules/metadata/actions";
import ProjectJsonSchemaForm from "./ProjectJsonSchemaForm";
import PropTypes from "prop-types";

const ProjectJsonSchemaModal = ({projectId, visible, onOk, onCancel}) => {
    const dispatch = useDispatch();
    const isCreatingJsonSchema = useSelector((state) => state.projects.isCreatingJsonSchema);
    const [inputFormFields, setInputFormFields] = useState({});
    const [fileContent, setFileContent] = useState(null);

    const reset = () => {
        setInputFormFields({});
        setFileContent(null);
    };

    const cancelReset = useCallback(() => {
        reset();
        onCancel();
    }, []);

    const handleCreateSubmit = useCallback(() => {
        const payload = {
            "project": projectId,
            "schemaType": inputFormFields.schemaType.value,
            "required": inputFormFields.required.value,
            "jsonSchema": fileContent,
        };
        dispatch(createProjectJsonSchemaIfPossible(payload));
        reset();
        onOk();
    }, [projectId, inputFormFields, fileContent]);

    return (
        <Modal
            visible={visible}
            width={648}
            title="Create project level JSON schema"
            bodyStyle={{
                "overflowY": "auto",
                "maxHeight": 800
            }}
            onCancel={cancelReset}
            footer={[
                <Button key="cancel" onClick={cancelReset}>Cancel</Button>,
                <Button key="create"
                        icon="plus"
                        type="primary"
                        onClick={handleCreateSubmit}
                        loading={isCreatingJsonSchema}>Create</Button>
            ]}
        >
            <ProjectJsonSchemaForm
                schemaTypes={["PHENOPACKET", "BIOSAMPLE", "INDIVIDUAL"]}
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
