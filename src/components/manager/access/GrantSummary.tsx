import { memo } from "react";
import { Descriptions } from "antd";

import type { StoredGrant } from "@/modules/authz/types";

import PermissionsList from "./PermissionsList";
import Resource from "./Resource";
import Subject from "./Subject";

export type GrantSummaryProps = {
  grant: StoredGrant;
};

const GrantSummary = memo(({ grant: { id, subject, resource, notes, permissions } }: GrantSummaryProps) => (
  <Descriptions
    layout="vertical"
    size="middle"
    column={1}
    bordered={true}
    title={`Grant ${id}`}
    items={[
      {
        label: "Subject",
        children: <Subject subject={subject} />,
      },
      {
        label: "Resource",
        children: <Resource resource={resource} />,
      },
      {
        label: "Notes",
        children: notes,
      },
      {
        label: "Permissions",
        children: <PermissionsList permissions={permissions} />,
      },
    ]}
  />
));

export default GrantSummary;
