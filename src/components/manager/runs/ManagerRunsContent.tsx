import { Route, Routes } from "react-router-dom";
import { Layout } from "antd";

import { RESOURCE_EVERYTHING, viewRuns } from "bento-auth-js";

import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import PermissionsGate from "@/components/PermissionsGate";
import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";

const ManagerRunsContent = () => {
  // TODO: each workflow should have definitions for permissions scopes, so we can instead check if we can run at
  //  least one workflow.

  return (
    <PermissionsGate
      resource={RESOURCE_EVERYTHING}
      requiredPermissions={[viewRuns]}
      forbiddenMessage="You do not have permission to view workflow runs."
    >
      <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
          <Routes>
            <Route path=":id/*" element={<RunDetailContent />} />
            <Route path="/" element={<RunListContent />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </PermissionsGate>
  );
};

export default ManagerRunsContent;
