import React, { useMemo } from "react";
import { useSelector } from "react-redux";

import { Popover, Table } from "antd";
// import { PlusOutlined } from "@ant-design/icons";

import { RESOURCE_EVERYTHING } from "bento-auth-js";
import { useResourcePermissionsWrapper } from "@/hooks";

import { stringifyJSONRenderIfMultiKey, rowKey } from "./utils";

// import ActionContainer from "../ActionContainer";
import PermissionsList from "./PermissionsList";
import Subject from "./Subject";

const GrantsTabContent = () => {
    const isFetchingAllServices = useSelector((state) => state.services.isFetchingAll);

    const { data: grants, isFetching: isFetchingGrants } = useSelector(state => state.grants);
    const { data: groups } = useSelector(state => state.groups);

    const groupsByID = useMemo(() => Object.fromEntries(groups.map(g => [g.id, g])), [groups]);

    const {
        // permissions,
        isFetchingPermissions,
        // hasAttemptedPermissions,
    } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);
    // const hasEditPermission = permissions.includes(editPermissions);

    const grantsColumns = useMemo(() => [
        {
            title: "ID",
            dataIndex: "id",
            width: 42,  // Effectively a minimum width, but means the ID column doesn't take up a weird amount of space
        },
        {
            title: "Subject",
            dataIndex: "subject",
            render: (subject) => (
                <Subject subject={subject} groupsByID={groupsByID} />
            ),
        },
        {
            title: "Resource",
            dataIndex: "resource",
            render: (resource) => {
                if (resource.everything) {
                    return <Popover content="Everything in this Bento instance.">Everything</Popover>;
                }
                return <pre>{stringifyJSONRenderIfMultiKey(resource)}</pre>;
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
        {
            title: "Permissions",
            dataIndex: "permissions",
            render: (permissions) => <PermissionsList permissions={permissions} />,
        },
        // TODO: enable when this becomes more than a viewer
        // ...(hasEditPermission ? [
        //     {
        //         title: "Actions",
        //         key: "actions",
        //         // TODO: hook up edit + delete
        //         render: () => (
        //             <>
        //                 <Button size="small" icon="edit" disabled={true}>Edit</Button>{" "}
        //                 <Button size="small" type="danger" icon="delete" disabled={true}>Delete</Button>
        //             </>
        //         ),
        //     },
        // ] : []),
    ], [groupsByID/*, hasEditPermission*/]);

    return (
        <>
            {/*{hasEditPermission && (*/}
            {/*    <ActionContainer style={{ marginBottom: 8 }}>*/}
            {/*        <Button icon={<PlusOutlined />}*/}
            {/*                loading={isFetchingPermissions || isFetchingGrants}>*/}
            {/*            Create Grant*/}
            {/*        </Button>*/}
            {/*    </ActionContainer>*/}
            {/*)}*/}
            <Table
                size="middle"
                bordered={true}
                columns={grantsColumns}
                dataSource={grants}
                rowKey={rowKey}
                loading={isFetchingAllServices || isFetchingPermissions || isFetchingGrants}
            />
        </>
    );
};

export default GrantsTabContent;
