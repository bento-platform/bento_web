import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { viewPermissions, RESOURCE_EVERYTHING, editPermissions } from "bento-auth-js";

import { Button, Layout, Popover, Table, Tabs, Typography } from "antd";

import { fetchGrantsIfNeeded, fetchGroupsIfNeeded } from "../../../modules/authz/actions";
import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";
import { useResourcePermissionsWrapper } from "../../../hooks";
import ForbiddenContent from "../ForbiddenContent";
import ActionContainer from "../ActionContainer";
import PermissionsList from "./PermissionsList";
import Subject from "./Subject";

const stringifyJSONRenderIfMultiKey = (x) =>
    JSON.stringify(
        x,
        null,
        (typeof x === "object" && Object.keys(x).length > 1) ? 2 : null,
    );

const GROUPS_COLUMNS = [
    {
        title: "ID",
        dataIndex: "id",
    },
    {
        title: "Name",
        dataIndex: "name",
    },
    {
        title: "Membership",
        dataIndex: "membership",
        render: (membership) => {
            const { expr, membership: membershipList } = membership;

            if (expr) {
                return <>
                    <strong>Expression:</strong>
                    <pre style={{ margin: 0 }}>{expr}</pre>
                </>;
            }

            // TODO: for now
            return <span>{membershipList.length} members</span>;
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
        title: "Actions",
        key: "actions",
        // TODO: hook up delete
        render: () => (
            <Button size="small" type="danger" icon="delete" disabled={true}>Delete</Button>
        ),
    },
];

const ManagerAccessContent = () => {
    const dispatch = useDispatch();

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
    const hasEditPermission = permissions.includes(editPermissions);

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
        ...(hasEditPermission ? [
            {
                title: "Actions",
                key: "actions",
                // TODO: hook up edit + delete
                render: () => (
                    <>
                        <Button size="small" icon="edit" disabled={true}>Edit</Button>{" "}
                        <Button size="small" type="danger" icon="delete" disabled={true}>Delete</Button>
                    </>
                ),
            },
        ] : []),
    ], [groupsByID, hasEditPermission]);

    if (hasAttemptedPermissions && !hasViewPermission) {
        return (
            <ForbiddenContent message="You do not have permission to view grants and groups." />
        );
    }

    return <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Tabs type="card">
                <Tabs.TabPane tab="Grants" key="grants">
                    {hasEditPermission && (
                        <ActionContainer style={{ marginBottom: 8 }}>
                            <Button icon="plus" loading={isFetchingPermissions || isFetchingGrants}>
                                Create Grant
                            </Button>
                        </ActionContainer>
                    )}
                    <Table
                        size="middle"
                        bordered={true}
                        columns={grantsColumns}
                        dataSource={grants}
                        loading={isFetchingPermissions || isFetchingGrants}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Groups" key="groups">
                    <Typography.Paragraph>
                        Expand a table row to see group membership entries.
                    </Typography.Paragraph>
                    <Table
                        size="middle"
                        bordered={true}
                        columns={GROUPS_COLUMNS}
                        dataSource={groups}
                        loading={isFetchingPermissions || isFetchingGroups}
                    />
                </Tabs.TabPane>
            </Tabs>
        </Layout.Content>
    </Layout>;
};

export default ManagerAccessContent;
