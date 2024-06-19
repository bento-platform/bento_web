import { type CSSProperties, type MouseEventHandler, useCallback, useMemo, useState } from "react";

import { Typography } from "antd";

const PERMISSIONS_LIST_STYLE: CSSProperties = { margin: 0, padding: 0, listStyle: "none", lineHeight: "1.6em" };
const MAX_COLLAPSED_PERMISSIONS = 4;

type PermissionsListProps = {
  permissions: string[];
};

const PermissionsList = ({ permissions }: PermissionsListProps) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  const sortedPermissions = useMemo(
    () =>
      permissions.sort((a, b) => {
        const as = a.split(":");
        const bs = b.split(":");
        return as[1].localeCompare(bs[1]) || as[0].localeCompare(bs[0]);
      }),
    [permissions],
  );

  const onShowAll: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
    setShowAll(true);
    e.preventDefault();
  }, []);

  const onCollapse: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
    setShowAll(false);
    e.preventDefault();
  }, []);

  return (
    <ul style={PERMISSIONS_LIST_STYLE}>
      {sortedPermissions.slice(0, showAll ? sortedPermissions.length : MAX_COLLAPSED_PERMISSIONS).map((p) => (
        <li key={p}>
          <Typography.Text code={true}>{p}</Typography.Text>
        </li>
      ))}
      {sortedPermissions.length > MAX_COLLAPSED_PERMISSIONS ? (
        showAll ? (
          <li>
            <a href="#" onClick={onCollapse}>
              - Collapse
            </a>
          </li>
        ) : (
          <li>
            <a href="#" onClick={onShowAll}>
              + {sortedPermissions.length - MAX_COLLAPSED_PERMISSIONS} more
            </a>
          </li>
        )
      ) : null}
    </ul>
  );
};

export default PermissionsList;
