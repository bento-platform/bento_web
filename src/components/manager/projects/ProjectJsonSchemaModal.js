import React, { useRef, useState } from "react";
import { Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createProjectJsonSchema } from "../../../modules/metadata/actions";
import ProjectJsonSchemaForm from "./ProjectJsonSchemaForm";
import PropTypes from "prop-types";

const ProjectJsonSchemaModal = ({projectId, visible, onOk, onCancel}) => {
    const dispatch = useDispatch();
    const isCreatingJsonSchema = useSelector((state) => state.projects.isCreatingJsonSchema)
    const [initialInputValues, _] = useState({});
    const [inputFormFields, setInputFormFields] = useState({});
    const [fileContent, setFileContent] = useState(null);

    const cancelReset = () => {
        setInputFormFields({});
        onCancel();
    };

    const handleCreateSubmit = async () => {
        const payload = {
            "project": projectId,
            "schemaType": inputFormFields.schemaType.value,
            "required": inputFormFields.required.value,
            "jsonSchema": fileContent,
        };
        console.log(payload);
        await dispatch(createProjectJsonSchema(payload));
        onOk();
    };

    return (
        <Modal
            visible={visible}
            width={648}
            title="Create project level JSON schema"
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
                initialValues={initialInputValues}
                formValues={inputFormFields}
                onChange={setInputFormFields}
                fileContent={fileContent}
                setFileContent={setFileContent}
                />
        </Modal>
    );
}

ProjectJsonSchemaModal.proptypes = {
    projectId: PropTypes.string.isRequired,
    visible: PropTypes.bool,

    onOk: PropTypes.func,
    onCancel: PropTypes.func,
}

export default ProjectJsonSchemaModal;
