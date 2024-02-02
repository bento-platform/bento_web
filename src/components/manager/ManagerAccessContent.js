import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useResourcePermissions, viewPermissions, RESOURCE_EVERYTHING } from "bento-auth-js";
import PropTypes from "prop-types";

import { Button, Layout, Popover, Table, Tabs, Typography } from "antd";

import { fetchGrantsIfNeeded, fetchGroupsIfNeeded } from "../../modules/authz/actions";
import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

const stringifyJSONRenderIfMultiKey = (x) =>
    JSON.stringify(
        x,
        null,
        (typeof x === "object" && Object.keys(x).length > 1) ? 2 : null,
    );

const PERMISSIONS_LIST_STYLE = { margin: 0, padding: 0, listStyle: "none", lineHeight: "1.6em" };

/**
 * @param {string[]} permissions
 * @return {React.JSX.Element}
 * @constructor
 */
const PermissionList = ({ permissions }) => {
    const [showAll, setShowAll] = useState(false);

    const onShowAll = useCallback((e) => {
        setShowAll(true);
        e.preventDefault();
    }, []);

    const onCollapse = useCallback((e) => {
        setShowAll(false);
        e.preventDefault();
    }, []);

    return (
        <ul style={PERMISSIONS_LIST_STYLE}>
            {permissions.slice(0, showAll ? permissions.length : 4).map((p) => (
                <li key={p}>
                    <Typography.Text code={true}>{p}</Typography.Text>
                </li>
            ))}
            {permissions.length > 4 ? (
                showAll ? (
                    <li><a href="#" onClick={onCollapse}>- Collapse</a></li>
                ) : (
                    <li><a href="#" onClick={onShowAll}>+ {permissions.length - 4} more</a></li>
                )
            ) : null}
        </ul>
    );
};
PermissionList.propTypes = {
    permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

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
        isFetching: fetchingPermissions,
    } = useResourcePermissions(RESOURCE_EVERYTHING, authorizationService?.url);

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
            render: (subject) => {
                const { sub, client, iss, group, everyone } = subject;

                if (sub || client) {
                    return (
                        <p style={{ margin: 0, lineHeight: "1.6em" }}>
                            <strong>{sub ? "Subject" : "Client"}:</strong>{" "}
                            <Typography.Text code={true}>{sub ?? client}</Typography.Text><br />
                            <strong>Issuer:</strong>{" "}
                            <Typography.Text code={true}>{iss}</Typography.Text><br />
                        </p>
                    );
                } else if (group) {
                    const groupDef = groupsByID[group];
                    // TODO: link
                    if (!groupDef) return <a>Group {group}</a>;
                    return <a>Group {group}: {groupDef.name}</a>;
                } else if (everyone) {
                    return <Popover content="Everyone, even anonymous users.">Everyone</Popover>;
                }

                // Base case
                return <pre>{stringifyJSONRenderIfMultiKey(subject)}</pre>;
            },
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
            render: (permissions) => <PermissionList permissions={permissions} />,
        },
        {
            title: "Actions",
            key: "actions",
            // TODO: hook up delete
            render: () => (
                <Button size="small" type="danger" icon="delete" disabled={true}>Delete</Button>
            ),
        },
    ], [groupsByID]);

    return <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Typography.Title level={2}>Access Management</Typography.Title>
            <Tabs>
                <Tabs.TabPane tab="Grants" key="grants">
                    <Table
                        size="middle"
                        bordered={true}
                        columns={grantsColumns}
                        dataSource={grants}
                        loading={fetchingPermissions || isFetchingGrants}
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
                        loading={fetchingPermissions || isFetchingGroups}
                    />
                </Tabs.TabPane>
            </Tabs>
        </Layout.Content>
    </Layout>;
};

export default ManagerAccessContent;
