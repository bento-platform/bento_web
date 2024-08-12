import React, { useMemo } from "react";

import { Table, type TableColumnsType } from "antd";

import type { StoredGrant } from "@/modules/authz/types";

import ExpiryTimestamp from "./ExpiryTimestamp";
import PermissionsList from "./PermissionsList";
import Resource from "./Resource";
import Subject from "./Subject";
import { rowKey } from "./utils";

export type GrantsTableProps = {
  grants: StoredGrant[];
  loading?: boolean;
  extraColumns?: TableColumnsType<StoredGrant>;
};

const GrantsTable = ({ grants, loading, extraColumns }: GrantsTableProps) => {
  const grantsColumns = useMemo(
    (): TableColumnsType<StoredGrant> => [
      {
        title: "ID",
        dataIndex: "id",
        width: 42, // Effectively a minimum width, but means the ID column doesn't take up a weird amount of space
      },
      {
        title: "Subject",
        dataIndex: "subject",
        render: (subject) => <Subject subject={subject} />,
      },
      {
        title: "Resource",
        dataIndex: "resource",
        render: (resource) => <Resource resource={resource} />,
      },
      {
        title: "Expiry",
        dataIndex: "expiry",
        render: (expiry) => <ExpiryTimestamp expiry={expiry} />,
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
      ...(extraColumns ?? []),
    ],
    [extraColumns],
  );

  return (
    <Table<StoredGrant>
      size="middle"
      bordered={true}
      columns={grantsColumns}
      dataSource={grants}
      rowKey={rowKey}
      loading={loading}
    />
  );
};

export default GrantsTable;
