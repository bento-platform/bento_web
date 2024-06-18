import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";

import { Button, Form, List, Modal, Table, type TableColumnsType, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import { editPermissions, RESOURCE_EVERYTHING } from "bento-auth-js";
import { useResourcePermissionsWrapper } from "@/hooks";


import ActionContainer from "@/components/manager/ActionContainer";
import { createGroup, deleteGroup, invalidateGroups, saveGroup } from "@/modules/authz/actions";
import { useGrants, useGroups } from "@/modules/authz/hooks";
import type { Group, SpecificSubject, StoredGrant, StoredGroup } from "@/modules/authz/types";
import { useServices } from "@/modules/services/hooks";
import { useAppDispatch } from "@/store";

import ExpiryTimestamp from "./ExpiryTimestamp";
import GrantsTable from "./GrantsTable";
import GroupForm from "./GroupForm";
import Subject from "./Subject";
import { rowKey } from "./utils";


const groupMemberListRender = (item: SpecificSubject) => (
    <List.Item><Subject subject={item} /></List.Item>
);

const GroupMembershipCell = ({ group }: { group: StoredGroup }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const openMembersModal = useCallback(() => setModalOpen(true), []);
    const closeMembersModal = useCallback(() => setModalOpen(false), []);

    const { id, name, membership } = group;

    if ("expr" in membership) {
        return (
            <>
                <strong>Expression:</strong>
                <pre style={{ margin: 0 }}>{JSON.stringify(membership.expr)}</pre>
            </>
        );
    }

    const { members: membersList } = membership;

    if (membersList.length === 0) {
        return <Button type="link" size="small" disabled={true}>0 entries</Button>;
    }

    return (
        <>
            <Modal
                open={modalOpen}
                onCancel={closeMembersModal}
                title={`Group: ${name} (ID: ${id}) - Membership`}
                footer={null}
                width={768}
            >
                <List dataSource={membersList} renderItem={groupMemberListRender} />
            </Modal>
            <Button type="link" size="small" onClick={openMembersModal}>
                {membersList.length} {membersList.length === 1 ? "entry" : "entries"}
            </Button>
        </>
    );
};

type DependentGrantsCellProps = {
    groupGrants: Record<number, StoredGrant[]>;
    group: StoredGroup;
};

const GRANTS_MODAL_STYLE: CSSProperties = { maxWidth: 1400 };

const DependentGrantsCell = ({ groupGrants, group }: DependentGrantsCellProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const openGrantsModal = useCallback(() => setModalOpen(true), []);
    const closeGrantsModal = useCallback(() => setModalOpen(false), []);

    const { id, name } = group;
    const dependentGrants = groupGrants[id] ?? [];

    return (
        <>
            <Modal
                open={modalOpen}
                onCancel={closeGrantsModal}
                title={`Group: ${name} (ID: ${id}) - Dependent Grants`}
                footer={null}
                width="90%"
                style={GRANTS_MODAL_STYLE}
            >
                <GrantsTable grants={dependentGrants} />
            </Modal>
            <Button type="link" size="small" onClick={openGrantsModal}>
                {dependentGrants.length} {dependentGrants.length === 1 ? "grant" : "grants"}
            </Button>
        </>
    );
};

const GROUP_MODAL_WIDTH = 800;

const GroupCreationModal = ({ open, closeModal }: { open: boolean; closeModal: () => void }) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            // Instead of resetting fields on close/finish, reset on next open to avoid
            // a re-render/sudden-form-change hiccup.
            form.resetFields();
        }
    }, [form, open]);

    const onOk = useCallback(() => {
        setLoading(true);
        form.validateFields().then(async (values) => {
            console.debug("received group values for creation:", values);
            await dispatch(createGroup(values));
            closeModal();
            // Form will be reset upon next open.
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    }, [dispatch, form, closeModal]);

    return (
        <Modal
            open={open}
            width={GROUP_MODAL_WIDTH}
            title="Create Group"
            onCancel={closeModal}
            onOk={onOk}
            okButtonProps={{ loading }}
            okText="Create"
        >
            <GroupForm form={form} />
        </Modal>
    );
};

type GroupEditModalProps = {
    group: StoredGroup | null,
    open: boolean;
    closeModal: () => void
};

const GroupEditModal = ({ group, open, closeModal }: GroupEditModalProps) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm<Group>();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (group) {
            form.setFieldsValue(group);
        }
    }, [form, group]);

    const name: string = Form.useWatch("name", form);

    const onOk = useCallback(() => {
        setLoading(true);
        form.validateFields().then(async (values) => {
            console.debug("received group values for saving:", values);
            await dispatch(saveGroup({ ...group, ...values }));
            closeModal();
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            // the PUT request to authorization returns no content, so:
            //  - on success, refresh all groups to get new data.
            //  - on error, refresh all groups to revert optimistically-updated values.
            dispatch(invalidateGroups());
            setLoading(false);
        });
    }, [dispatch, form, group, closeModal]);

    return (
        <Modal
            open={open}
            width={GROUP_MODAL_WIDTH}
            title={`Edit Group ${group?.id}: "${name}"`}
            onCancel={closeModal}
            onOk={onOk}
            okButtonProps={{ loading }}
            okText="Save"
        >
            <GroupForm form={form} />
        </Modal>
    );
};


const GroupsTabContent = () => {
    const dispatch = useAppDispatch();

    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const openCreateModal = useCallback(() => setCreateModalOpen(true), []);
    const closeCreateModal = useCallback(() => setCreateModalOpen(false), []);

    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const closeEditModal = useCallback(() => setEditModalOpen(false), []);

    const [selectedGroup, setSelectedGroup] = useState<StoredGroup | null>(null);

    const [modal, contextHolder] = Modal.useModal();

    const isFetchingAllServices = useServices().isFetchingAll;

    const { data: grants, isFetching: isFetchingGrants } = useGrants();
    const { data: groups, isFetching: isFetchingGroups } = useGroups();

    const groupGrants = useMemo(
        () => {
            const res: Record<number, StoredGrant[]> = {};

            // TODO: future: replace with Object.groupBy
            grants.forEach((g: StoredGrant) => {
                if (!("group" in g.subject)) return;
                const groupID = g.subject.group;
                if (!(groupID in res)) {
                    res[groupID] = [g];
                } else {
                    res[groupID].push(g);
                }
            });

            return res;
        },
        [grants]);

    const { permissions, isFetchingPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

    // Right now, we don't have a way to scope groups to projects - so require { resource: everything } to create.
    const hasEditPermission = permissions.includes(editPermissions);

    const columns = useMemo((): TableColumnsType<StoredGroup> => [
        {
            title: "ID",
            dataIndex: "id",
            width: 42,  // Effectively a minimum width, but means the ID column doesn't take up a weird amount of space
            render: (id) => <span id={`group-${id}`}>{id}</span>,
        },
        {
            title: "Name",
            dataIndex: "name",
        },
        {
            title: "Membership",
            dataIndex: "membership",
            render: (_, group) => <GroupMembershipCell group={group} />,
        },
        {
            title: "Dependent Grants",
            key: "grants",
            render: (group) => <DependentGrantsCell groupGrants={groupGrants} group={group} />,
        },
        {
            title: "Expiry",
            dataIndex: "expiry",
            render: (expiry) => <ExpiryTimestamp expiry={expiry} />,
        },
        {
            title: "Notes",
            dataIndex: "notes",
        },
        ...(hasEditPermission ? [{
            title: "Actions",
            key: "actions",
            // TODO: hook up delete
            render: (group) => (
                <>
                    <Button size="small" icon={<EditOutlined />} disabled={editModalOpen} onClick={() => {
                        setSelectedGroup(group);
                        setEditModalOpen(true);
                    }}>Edit</Button>{" "}
                    <Button
                        size="small"
                        danger={true}
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            const nGrants = groupGrants[group.id]?.length ?? 0;
                            const grantNoun = `grant${nGrants === 1 ? "" : "s"}`;

                            modal.confirm({
                                title: <>
                                    Are you sure you wish to delete group &ldquo;{group.name}&rdquo; (ID: {group.id}),
                                    as well as {nGrants} dependent {grantNoun}?
                                </>,
                                content: (
                                    <Typography.Paragraph>
                                        Doing so will alter who can view or manipulate data inside this Bento
                                        instance, and may even affect <strong>your own</strong> access!
                                    </Typography.Paragraph>
                                ),
                                okButtonProps: { danger: true, icon: <DeleteOutlined /> },
                                okText: `Delete group and ${nGrants} ${grantNoun}`,
                                onOk: () => dispatch(deleteGroup(group)),
                                width: 600,
                                maskClosable: true,
                            });
                        }}
                    >Delete</Button>
                </>
            ),
        }] as TableColumnsType<StoredGroup> : []),
    ], [dispatch, hasEditPermission, groupGrants, editModalOpen, modal]);

    return (
        <>
            {contextHolder}
            <ActionContainer style={{ marginBottom: 8 }}>
                {hasEditPermission && (
                    <Button icon={<PlusOutlined />}
                            loading={isFetchingPermissions || isFetchingGroups}
                            onClick={openCreateModal}>
                        Create Group
                    </Button>
                )}
            </ActionContainer>
            <GroupCreationModal open={createModalOpen} closeModal={closeCreateModal} />
            <GroupEditModal group={selectedGroup} open={editModalOpen} closeModal={closeEditModal} />
            {/* No pagination on this table, so we can link to all group ID anchors: */}
            <Table<StoredGroup>
                size="middle"
                bordered={true}
                pagination={false}
                columns={columns}
                dataSource={groups}
                rowKey={rowKey}
                loading={isFetchingAllServices || isFetchingPermissions || isFetchingGrants || isFetchingGroups}
            />
        </>
    );
};

export default GroupsTabContent;
