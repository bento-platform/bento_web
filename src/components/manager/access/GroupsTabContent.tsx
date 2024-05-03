import React, { useCallback, useMemo, useState } from "react";

import { Button, Form, List, Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { editPermissions, RESOURCE_EVERYTHING } from "bento-auth-js";
import { useResourcePermissionsWrapper } from "@/hooks";


import ActionContainer from "@/components/manager/ActionContainer";
import { createGroup, deleteGroup } from "@/modules/authz/actions";
import { useGrants, useGroups } from "@/modules/authz/hooks";
import { StoredGrant, StoredGroup } from "@/modules/authz/types";
import { useAppDispatch } from "@/store";

import GrantsTable from "./GrantsTable";
import GroupForm from "./GroupForm";
import Subject from "./Subject";
import { rowKey } from "./utils";
import { useServices } from "@/modules/services/hooks";


const GroupMembershipCell = ({ group }: { group: StoredGroup }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const { id, name, membership } = group;

    if ("expr" in membership) {
        return (
            <>
                <strong>Expression:</strong>
                <pre style={{ margin: 0 }}>{membership.expr}</pre>
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
                onCancel={() => setModalOpen(false)}
                title={`Group: ${name} (ID: ${id}) - Membership`}
                footer={null}
                width={768}
            >
                <List dataSource={membersList} renderItem={(item) => <Subject subject={item} />} />
            </Modal>
            <Button type="link" size="small" onClick={() => setModalOpen(true)}>
                {membersList.length} {membersList.length === 1 ? "entry" : "entries"}
            </Button>
        </>
    );
};

type DependentGrantsCellProps = {
    groupGrants: Record<number, StoredGrant[]>;
    group: StoredGroup;
};

const DependentGrantsCell = ({ groupGrants, group }: DependentGrantsCellProps) => {
    const [modalOpen, setModalOpen] = useState(false);

    const { id, name } = group;
    const dependentGrants = groupGrants[id] ?? [];

    return (
        <>
            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                title={`Group: ${name} (ID: ${id}) - Dependent Grants`}
                footer={null}
                width="90%"
                style={{ maxWidth: 1400 }}
            >
                <GrantsTable grants={dependentGrants} />
            </Modal>
            <Button type="link" size="small" onClick={() => setModalOpen(true)}>
                {dependentGrants.length} {dependentGrants.length === 1 ? "grant" : "grants"}
            </Button>
        </>
    );
};


const GroupCreationModal = ({ open, onCancel }: { open: boolean; onCancel: () => void }) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();

    const onOk = useCallback(() => {
        form.validateFields().then((values) => {
            console.debug("received group values for creation:", values);
            return dispatch(createGroup(values));
        }).catch((err) => {
            console.error(err);
        });
    }, [dispatch, form]);

    return <Modal open={open} width={720} title="Create Group" onOk={onOk} onCancel={onCancel} okText="Create">
        <GroupForm form={form} />
    </Modal>;
};


const GroupsTabContent = () => {
    const dispatch = useAppDispatch();

    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
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

    const columns = useMemo((): ColumnsType<StoredGroup> => [
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
            render: (expiry) => <span>{expiry ?? "—"}</span>,
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
                <Button
                    size="small"
                    danger={true}
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        const nGrants = groupGrants[group.id]?.length ?? 0;

                        modal.confirm({
                            title: <>
                                Are you sure you wish to delete group {group.id}, as well as {nGrants} dependent
                                grant{nGrants === 1 ? "" : "s"}?
                            </>,
                            content: <>

                            </>,
                            okButtonProps: { danger: true },
                            onOk: () => dispatch(deleteGroup(group)),
                            width: 600,
                            maskClosable: true,
                        });
                    }}
                >Delete</Button>
            ),
        }] as ColumnsType<StoredGroup> : []),
    ], [dispatch, hasEditPermission, groupGrants]);

    return (
        <>
            {contextHolder}
            <ActionContainer style={{ marginBottom: 8 }}>
                {hasEditPermission && (
                    <Button icon={<PlusOutlined />}
                            loading={isFetchingPermissions || isFetchingGroups}
                            onClick={() => setCreateModalOpen(true)}>
                        Create Group
                    </Button>
                )}
            </ActionContainer>
            <GroupCreationModal open={createModalOpen} onCancel={() => setCreateModalOpen(false)} />
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
