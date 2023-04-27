import React, { useRef } from "react";
import { Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createProjectJsonSchema } from "../../../modules/metadata/actions";
import ProjectJsonSchemaForm from "./ProjectJsonSchemaForm";
import PropTypes from "prop-types";

const ProjectJsonSchemaModal = ({projectId, visible, onOk, onCancel}) => {
    const dispatch = useDispatch();
    const formRef = useRef(null);
    const isCreatingJsonSchema = useSelector((state) => state.projects.isCreatingJsonSchema)

    const resetFields = () => {
        if (formRef.current) {
            formRef.current.resetFields()
        }
    };

    const cancelReset = () => {
        resetFields();
        onCancel();
    };

    const handleCreateSubmit = () => {
        // dispatch(createProjectJsonSchema())
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
                ref={formRef}
                projectId={projectId}
                schemaTypes={["PHENOPACKET", "BIOSAMPLE", "INDIVIDUAL"]}/>
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
