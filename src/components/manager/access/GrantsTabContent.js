import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Button, Modal, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import { editPermissions, makeResourceKey } from "bento-auth-js";

import { deleteGrant } from "@/modules/authz/actions";
import { useAuthzManagementPermissions, useGrants, useGroupsByID } from "@/modules/authz/hooks";

import ActionContainer from "../ActionContainer";
import GrantForm from "./GrantForm";
import GrantSummary from "./GrantSummary";
import GrantsTable from "./GrantsTable";

const GrantCreationModal = ({ open, onCancel }) => {
    return <Modal open={open} width={720} title="Create Grant" onCancel={onCancel}><GrantForm /></Modal>;
};
GrantCreationModal.propTypes = {
    open: PropTypes.bool,
    onCancel: PropTypes.func,
};

const GrantsTabContent = () => {
    const dispatch = useDispatch();

    const isFetchingAllServices = useSelector((state) => state.services.isFetchingAll);

    const { data: grants, isFetching: isFetchingGrants } = useGrants();
    const groupsByID = useGroupsByID();

    const {
        isFetching: isFetchingPermissions,
        hasAtLeastOneEditPermissionsGrant,
        grantResourcePermissionsObjects,
    } = useAuthzManagementPermissions();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [modal, contextHolder] = Modal.useModal();

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
                        <Button size="small" icon={<EditOutlined />} loading={pLoading} disabled={!canEdit}>
                            Edit</Button>{" "}
                        <Button
                            size="small"
                            danger={true}
                            icon={<DeleteOutlined />}
                            loading={pLoading}
                            disabled={!canEdit}
                            onClick={() => {
                                modal.confirm({
                                    title: <>Are you sure you wish to delete grant {grant.id}?</>,
                                    content: <>
                                        <Typography.Paragraph>
                                            Doing so will alter who can view or manipulate data inside this Bento
                                            instance, and may even affect <strong>your own</strong> access!
                                        </Typography.Paragraph>
                                        <GrantSummary grant={grant} onCancel={() => setCreateModalOpen(false)} />
                                    </>,
                                    okButtonProps: { danger: true },
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
        [dispatch, groupsByID, grantResourcePermissionsObjects, hasAtLeastOneEditPermissionsGrant, modal]);

    return (
        <>
            {contextHolder}
            {hasAtLeastOneEditPermissionsGrant && (
                <ActionContainer style={{ marginBottom: 8 }}>
                    <Button icon={<PlusOutlined />} loading={isFetchingPermissions || isFetchingGrants} onClick={() => {
                        setCreateModalOpen(true);
                    }}>
                        Create Grant
                    </Button>
                </ActionContainer>
            )}
            <GrantCreationModal open={createModalOpen} onCancel={() => setCreateModalOpen(false)} />
            <GrantsTable
                grants={grants}
                loading={isFetchingAllServices || isFetchingPermissions || isFetchingGrants}
                extraColumns={extraColumns}
            />
        </>
    );
};

export default GrantsTabContent;
