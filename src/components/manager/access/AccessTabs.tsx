import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Tabs } from "antd";
import type { TabsProps } from "antd";

import { useAuthzManagementPermissions } from "@/modules/authz/hooks";

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
    const navigate = useNavigate();
    const { tab } = useParams();

    const {
        hasAtLeastOneViewPermissionsGrant,
        hasAttempted: hasAttemptedPermissions,
    } = useAuthzManagementPermissions();

    const onTabClick = useCallback((key: string) => {
        navigate(`../${key}`);
    }, [navigate]);

    if (hasAttemptedPermissions && !hasAtLeastOneViewPermissionsGrant) {
        return (
            <ForbiddenContent message="You do not have permission to view grants and groups." />
        );
    }
    return (
        <Tabs type="card" activeKey={tab} onTabClick={onTabClick} items={TAB_ITEMS} />
    );
};

export default AccessTabs;
