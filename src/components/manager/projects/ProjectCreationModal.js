import React, { useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { Button, Modal } from "antd";

import ProjectForm from "./ProjectForm";

import { toggleProjectCreationModal } from "../../../modules/manager/actions";
import { createProjectIfPossible } from "../../../modules/metadata/actions";
import { PlusOutlined } from "@ant-design/icons";

const ProjectCreationModal = () => {

    const dispatch = useDispatch();
    const history = useHistory();

    const form = useRef(null);

    const showCreationModal = useSelector(state => state.manager.projectCreationModal);
    const isCreatingProject = useSelector(state => state.projects.isCreating);

    const handleCreateCancel = useCallback(() => {
        dispatch(toggleProjectCreationModal());
    }, [dispatch]);

    const handleCreateSubmit = useCallback(() => {
        if (!form.current) {
            console.error("Missing form ref.");
        }

        form.current.validateFields().then(async (values) => {
            await dispatch(createProjectIfPossible(values, history));
            form.current.resetFields();
            dispatch(toggleProjectCreationModal());
        }).catch((err) => {
            console.error(err);
        });
    }, [dispatch]);

    return (
        <Modal
            open={showCreationModal}
            title="Create Project" width={600} footer={[
                <Button key="cancel" onClick={handleCreateCancel}>Cancel</Button>,
                <Button key="create"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={handleCreateSubmit}
                        loading={isCreatingProject}>Create</Button>,
            ]}
            onCancel={handleCreateCancel}
        >
            <ProjectForm formRef={form} />
        </Modal>
    );

};

export default ProjectCreationModal;
