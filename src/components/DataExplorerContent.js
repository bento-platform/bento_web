import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { SITE_NAME } from "@/constants";
import { useCanQueryAtLeastOneProjectOrDataset } from "@/modules/authz/hooks";

import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";
import ExplorerIndividualContent from "./explorer/ExplorerIndividualContent";
import ExplorerSearchContent from "./explorer/ExplorerSearchContent";
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
    <Routes>
      <Route path="search/*" element={<ExplorerSearchContent />} />
      <Route path="individuals/:individual/*" element={<ExplorerIndividualContent />} />
      <Route path="genome/*" element={<ExplorerGenomeBrowserContent />} />
      <Route path="*" element={<Navigate to="search" replace={true} />} />
    </Routes>
  );
};
export default DataExplorerContent;
