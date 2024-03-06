import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { viewPermissions, RESOURCE_EVERYTHING/*, editPermissions*/ } from "bento-auth-js";

import { /*Button, */Popover, Table, Tabs } from "antd";
// import { PlusOutlined } from "@ant-design/icons";

import { useResourcePermissionsWrapper } from "@/hooks";
import { fetchGrantsIfNeeded, fetchGroupsIfNeeded } from "@/modules/authz/actions";

// import ActionContainer from "../ActionContainer";
import ForbiddenContent from "../ForbiddenContent";
import PermissionsList from "./PermissionsList";
import Subject from "./Subject";

import { stringifyJSONRenderIfMultiKey } from "./utils";
import { useHistory, useRouteMatch } from "react-router-dom";

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

const rowKey = (row) => row.id.toString();

const AccessTabs = () => {
    const dispatch = useDispatch();

    const history = useHistory();
    const { url } = useRouteMatch();
    const splitUrl = url.split("/");
    const selectedTab = splitUrl.at(-1);

    const isFetchingAllServices = useSelector((state) => state.services.isFetchingAll);
    const authorizationService = useSelector(state => state.services.itemsByKind.authorization);
    const { data: grants, isFetching: isFetchingGrants } = useSelector(state => state.grants);
    const { data: groups, isFetching: isFetchingGroups } = useSelector(state => state.groups);

    const groupsByID = useMemo(() => Object.fromEntries(groups.map(g => [g.id, g])), [groups]);

    const {
        permissions,
        isFetchingPermissions,
        hasAttemptedPermissions,
    } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

    const hasViewPermission = permissions.includes(viewPermissions);
    // const hasEditPermission = permissions.includes(editPermissions);

    useEffect(() => {
        if (authorizationService && permissions.includes(viewPermissions)) {
            dispatch(fetchGrantsIfNeeded());
            dispatch(fetchGroupsIfNeeded());
        }
    }, [authorizationService, permissions]);

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

    if (hasAttemptedPermissions && !hasViewPermission) {
        return (
            <ForbiddenContent message="You do not have permission to view grants and groups." />
        );
    }

    return (
        <Tabs type="card" activeKey={selectedTab} onTabClick={(key) => {
            history.push(`${splitUrl.slice(0, -1).join("/")}/${key}`);
        }} items={[
            {
                key: "grants",
                label: "Grants",
                children: (
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
                ),
            },
            {
                key: "groups",
                label: "Groups",
                children: (
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
                ),
            },
        ]} />
    );
};

export default AccessTabs;
