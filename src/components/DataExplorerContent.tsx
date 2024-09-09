import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { SITE_NAME } from "@/constants";
import { useCanQueryAtLeastOneProjectOrDataset } from "@/modules/authz/hooks";

import ForbiddenContent from "./ForbiddenContent";

const DataExplorerContent = () => {
  useEffect(() => {
    document.title = `${SITE_NAME} - Explore Your Data`;
  }, []);

  const { hasPermission: canQueryData, hasAttempted: hasAttemptedQueryPermissions } =
    useCanQueryAtLeastOneProjectOrDataset();

  if (hasAttemptedQueryPermissions && !canQueryData) {
    return <ForbiddenContent message="You do not have permission to query any data." />;
  }

  return (
    <Outlet />
  );
};
export default DataExplorerContent;
