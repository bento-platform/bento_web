import { useEffect, useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { SITE_NAME } from "@/constants";
import { useCanQueryAtLeastOneProjectOrDataset } from "@/modules/authz/hooks";

import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";
import ExplorerIndividualContent from "./explorer/ExplorerIndividualContent";
import ExplorerSearchContent from "./explorer/ExplorerSearchContent";
import PermissionsGate from "./PermissionsGate";

const DataExplorerContent = () => {
  useEffect(() => {
    document.title = `${SITE_NAME} - Explore Your Data`;
  }, []);

  const perms = useCanQueryAtLeastOneProjectOrDataset();
  const permsCheck = useMemo(() => {
    const { hasPermission: canQueryData, hasAttempted: hasAttemptedQueryPermissions } = perms;
    return { hasPermissions: !hasAttemptedQueryPermissions || !canQueryData, debugState: perms };
  }, [perms]);

  return (
    <PermissionsGate check={permsCheck} forbiddenMessage="You do not have permission to query any data.">
      <Routes>
        <Route path="search/*" element={<ExplorerSearchContent />} />
        <Route path="individuals/:individual/*" element={<ExplorerIndividualContent />} />
        <Route path="genome/*" element={<ExplorerGenomeBrowserContent />} />
        <Route path="*" element={<Navigate to="search" replace={true} />} />
      </Routes>
    </PermissionsGate>
  );
};
export default DataExplorerContent;
