import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useRouteMatch } from "react-router-dom";

import { Tabs } from "antd";

import { viewPermissions, RESOURCE_EVERYTHING } from "bento-auth-js";

import { useResourcePermissionsWrapper } from "@/hooks";
import { fetchGrantsIfNeeded, fetchGroupsIfNeeded } from "@/modules/authz/actions";

import ForbiddenContent from "../ForbiddenContent";
import GroupsTabContent from "./GroupsTabContent";
import GrantsTabContent from "./GrantsTabContent";

const TAB_ITEMS = [
    {
        key: "grants",
        label: "Grants",
        children: <GrantsTabContent />,
    },
    {
        key: "groups",
        label: "Groups",
        children: <GroupsTabContent />,
    },
];

const AccessTabs = () => {
    const dispatch = useDispatch();

    const history = useHistory();
    const { url } = useRouteMatch();
    const splitUrl = useMemo(() => url.split("/"), [url]);
    const selectedTab = splitUrl.at(-1);

    const { permissions, hasAttemptedPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

    const hasViewPermission = permissions.includes(viewPermissions);

    const authorizationService = useSelector(state => state.services.itemsByKind.authorization);
    useEffect(() => {
        if (authorizationService && permissions.includes(viewPermissions)) {
            dispatch(fetchGrantsIfNeeded());
            dispatch(fetchGroupsIfNeeded());
        }
    }, [authorizationService, permissions]);

    const onTabClick = useCallback((key) => {
        history.push(`${splitUrl.slice(0, -1).join("/")}/${key}`);
    }, [history, splitUrl]);

    if (hasAttemptedPermissions && !hasViewPermission) {
        return (
            <ForbiddenContent message="You do not have permission to view grants and groups." />
        );
    }
    return (
        <Tabs type="card" activeKey={selectedTab} onTabClick={onTabClick} items={TAB_ITEMS} />
    );
};

export default AccessTabs;
