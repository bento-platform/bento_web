import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Tabs } from "antd";
import type { TabsProps } from "antd";

import { viewPermissions, RESOURCE_EVERYTHING } from "bento-auth-js";

import { useResourcePermissionsWrapper } from "@/hooks";
import { fetchGrants, fetchGroups } from "@/modules/authz/actions";
import { useService } from "@/modules/services/hooks";

import ForbiddenContent from "../../ForbiddenContent";
import GrantsTabContent from "./GrantsTabContent";
import GroupsTabContent from "./GroupsTabContent";

const TAB_ITEMS: TabsProps["items"] = [
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

    const navigate = useNavigate();
    const { tab } = useParams();

    const { permissions, hasAttemptedPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

    const hasViewPermission = permissions.includes(viewPermissions);

    const authorizationService = useService("authorization");
    useEffect(() => {
        if (authorizationService && permissions.includes(viewPermissions)) {
            dispatch(fetchGrants());
            dispatch(fetchGroups());
        }
    }, [authorizationService, permissions]);

    const onTabClick = useCallback((key: string) => {
        navigate(`../${key}`);
    }, [navigate]);

    if (hasAttemptedPermissions && !hasViewPermission) {
        return (
            <ForbiddenContent message="You do not have permission to view grants and groups." />
        );
    }
    return (
        <Tabs type="card" activeKey={tab} onTabClick={onTabClick} items={TAB_ITEMS} />
    );
};

export default AccessTabs;
