import React, { useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Button, List, Modal, Table } from "antd";
// import { PlusOutlined } from "@ant-design/icons";

import { RESOURCE_EVERYTHING } from "bento-auth-js";
import { useResourcePermissionsWrapper } from "@/hooks";

import Subject from "./Subject";

import { rowKey } from "./utils";

const GroupMembershipCell = ({ group }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const { id, name, membership } = group;
    const { expr, members: membersList } = membership;

    if (expr) {
        return (
            <>
                <strong>Expression:</strong>
                <pre style={{ margin: 0 }}>{expr}</pre>
            </>
        );
    }

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
GroupMembershipCell.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        membership: PropTypes.oneOfType([
            PropTypes.shape({
                expr: PropTypes.array,
            }),
            PropTypes.shape({
                members: PropTypes.arrayOf(PropTypes.oneOfType([
                    PropTypes.shape({
                        iss: PropTypes.string,
                        sub: PropTypes.string,
                    }),
                    PropTypes.shape({
                        iss: PropTypes.string,
                        client: PropTypes.string,
                    }),
                ])),
            }),
        ]).isRequired,
    }).isRequired,
};

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
        render: (_, group) => <GroupMembershipCell group={group} />,
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
