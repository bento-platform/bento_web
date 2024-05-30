import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Button, Form, Modal, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { editPermissions, makeResourceKey } from "bento-auth-js";

import ActionContainer from "@/components/manager/ActionContainer";
import { createGrant, deleteGrant } from "@/modules/authz/actions";
import { useAuthzManagementPermissions, useGrants, useGroupsByID } from "@/modules/authz/hooks";
import { useServices } from "@/modules/services/hooks";
import { useAppDispatch } from "@/store";

import GrantForm from "./GrantForm";
import GrantSummary from "./GrantSummary";
import GrantsTable from "./GrantsTable";

const GrantCreationModal = ({ open, closeModal }) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            // Instead of resetting fields on close/finish, reset on next open to avoid
            // a re-render/sudden-form-change hiccup.
            form.resetFields();
        }
    }, [open]);

    const onOk = useCallback(() => {
        setLoading(true);
        form.validateFields().then(async (values) => {
            console.debug("received grant values for creation:", values);
            await dispatch(createGrant(values));
            closeModal();
            // Form will be reset upon next open.
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    }, [dispatch, form]);

    return (
        <Modal
            open={open}
            width={720}
            title="Create Grant"
            onCancel={closeModal}
            onOk={onOk}
            okText="Create"
            okButtonProps={{ loading }}
        >
            <GrantForm form={form} />
        </Modal>
    );
};
GrantCreationModal.propTypes = {
    open: PropTypes.bool,
    closeModal: PropTypes.func,
};

const GrantsTabContent = () => {
    const dispatch = useAppDispatch();

    const isFetchingAllServices = useServices().isFetchingAll;

    const { data: grants, isFetching: isFetchingGrants } = useGrants();
    const groupsByID = useGroupsByID();

    const {
        isFetching: isFetchingPermissions,
        hasAtLeastOneEditPermissionsGrant,
        grantResourcePermissionsObjects,
    } = useAuthzManagementPermissions();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const openCreateModal = useCallback(() => setCreateModalOpen(true), []);
    const closeCreateModal = useCallback(() => setCreateModalOpen(false), []);
    const [deleteModal, deleteModalContextHolder] = Modal.useModal();

    const extraColumns = useMemo(() =>
        hasAtLeastOneEditPermissionsGrant ? [{
            title: "Actions",
            key: "actions",
            // TODO: hook up edit
            render: (grant) => {
                const pObj = grantResourcePermissionsObjects[makeResourceKey(grant.resource)];
                const pLoading = pObj.isFetching;
                const canEdit = pObj.permissions.includes(editPermissions);
                return (
                    <>
                        {/*TODO: no edit grant right now; originally designed to be immutable but this should change*/}
                        {/*<Button size="small" icon={<EditOutlined />} loading={pLoading} disabled={!canEdit}>*/}
                        {/*    Edit</Button>{" "}*/}
                        <Button
                            size="small"
                            danger={true}
                            icon={<DeleteOutlined />}
                            loading={pLoading}
                            disabled={!canEdit}
                            onClick={() => {
                                deleteModal.confirm({
                                    title: <>Are you sure you wish to delete grant {grant.id}?</>,
                                    content: <>
                                        <Typography.Paragraph>
                                            Doing so will alter who can view or manipulate data inside this Bento
                                            instance, and may even affect <strong>your own</strong> access!
                                        </Typography.Paragraph>
                                        <GrantSummary grant={grant} onCancel={() => setCreateModalOpen(false)} />
                                    </>,
                                    okButtonProps: { danger: true, icon: <DeleteOutlined /> },
                                    okText: "Delete",
                                    onOk: () => dispatch(deleteGrant(grant)),
                                    width: 600,
                                    maskClosable: true,
                                });
                            }}
                        >Delete</Button>
                    </>
                );
            },
        }] : [],
    [dispatch, groupsByID, grantResourcePermissionsObjects, hasAtLeastOneEditPermissionsGrant, deleteModal]);

    return (
        <>
            {deleteModalContextHolder}
            {hasAtLeastOneEditPermissionsGrant && (
                <ActionContainer style={{ marginBottom: 8 }}>
                    <Button
                        icon={<PlusOutlined />}
                        loading={isFetchingPermissions || isFetchingGrants}
                        onClick={openCreateModal}
                    >
                        Create Grant
                    </Button>
                </ActionContainer>
            )}
            <GrantCreationModal open={createModalOpen} closeModal={closeCreateModal} />
            <GrantsTable
                grants={grants}
                loading={isFetchingAllServices || isFetchingPermissions || isFetchingGrants}
                extraColumns={extraColumns}
            />
        </>
    );
};

export default GrantsTabContent;
