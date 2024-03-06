import React from "react";
import { useSelector } from "react-redux";

import { Table } from "antd";
// import { PlusOutlined } from "@ant-design/icons";

import { RESOURCE_EVERYTHING } from "bento-auth-js";
import { useResourcePermissionsWrapper } from "@/hooks";

import { rowKey } from "./utils";

const GROUPS_COLUMNS = [
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
        render: (membership) => {
            const { expr, members: membersList } = membership;

            if (expr) {
                return (
                    <>
                        <strong>Expression:</strong>
                        <pre style={{ margin: 0 }}>{expr}</pre>
                    </>
                );
            }

            return (
                <span>{membersList.length} {membersList.length === 1 ? "entry" : "entries"}</span>
            );
        },
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
    // TODO: enable when this becomes more than a viewer
    // {
    //     title: "Actions",
    //     key: "actions",
    //     // TODO: hook up delete
    //     render: () => (
    //         <Button size="small" type="danger" icon="delete" disabled={true}>Delete</Button>
    //     ),
    // },
];

const GroupsTabContent = () => {
    const isFetchingAllServices = useSelector((state) => state.services.isFetchingAll);
    const { data: groups, isFetching: isFetchingGroups } = useSelector(state => state.groups);

    const {
        // permissions,
        isFetchingPermissions,
        // hasAttemptedPermissions,
    } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);
    // const hasEditPermission = permissions.includes(editPermissions);

    return (
        <>
            {/*<ActionContainer style={{ marginBottom: 8 }}>*/}
            {/*    {hasEditPermission && (*/}
            {/*        <Button icon={<PlusOutlined />}*/}
            {/*                loading={isFetchingPermissions || isFetchingGroups}>*/}
            {/*            Create Group*/}
            {/*        </Button>*/}
            {/*    )}*/}
            {/*</ActionContainer>*/}
            {/* No pagination on this table, so we can link to all group ID anchors: */}
            <Table
                size="middle"
                bordered={true}
                pagination={false}
                columns={GROUPS_COLUMNS}
                dataSource={groups}
                rowKey={rowKey}
                loading={isFetchingAllServices || isFetchingPermissions || isFetchingGroups}
            />
        </>
    );
};

export default GroupsTabContent;
