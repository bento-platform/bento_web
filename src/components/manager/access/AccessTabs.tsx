import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Tabs, type TabsProps } from "antd";

import { useAuthzManagementPermissions } from "@/modules/authz/hooks";

import PermissionsGate from "@/components/PermissionsGate";
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

  const authzPerms = useAuthzManagementPermissions();
  const permsCheck = useMemo(() => {
    const { hasAtLeastOneViewPermissionsGrant, hasAttempted: hasAttemptedPermissions } = authzPerms;
    return { hasPermissions: !hasAttemptedPermissions || hasAtLeastOneViewPermissionsGrant, debugState: authzPerms };
  }, [authzPerms]);

  const onTabClick = useCallback(
    (key: string) => {
      navigate(`../${key}`);
    },
    [navigate],
  );

  return (
    <PermissionsGate check={permsCheck} forbiddenMessage="You do not have permission to view grants and groups.">
      <Tabs type="card" activeKey={tab} onTabClick={onTabClick} items={TAB_ITEMS} />
    </PermissionsGate>
  );
};

export default AccessTabs;
