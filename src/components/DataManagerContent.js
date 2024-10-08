import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Menu, Skeleton } from "antd";

import { SITE_NAME } from "@/constants";
import { useManagerPermissions } from "@/modules/authz/hooks";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import SitePageHeader from "./SitePageHeader";

const ManagerProjectDatasetContent = lazy(() => import("./manager/projects/ManagerProjectDatasetContent"));
const ManagerAccessContent = lazy(() => import("./manager/access/ManagerAccessContent"));
const ManagerDropBoxContent = lazy(() => import("./manager/dropBox/ManagerDropBoxContent"));
const ManagerIngestionContent = lazy(() => import("./manager/ManagerIngestionContent"));
const ManagerAnalysisContent = lazy(() => import("./manager/ManagerAnalysisContent"));
const ManagerExportContent = lazy(() => import("./manager/ManagerExportContent"));
const ManagerRunsContent = lazy(() => import("./manager/runs/ManagerRunsContent"));
const ManagerDRSContent = lazy(() => import("./manager/drs/ManagerDRSContent"));

const styles = {
  menu: {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px",
  },
  suspenseFallback: { padding: "24px", backgroundColor: "white" },
};

const DataManagerContent = () => {
  useEffect(() => {
    document.title = `${SITE_NAME}: Admin / Data Manager`;
  }, []);

  const managerPermissions = useManagerPermissions();

  const {
    canManageProjectsDatasets,
    canViewDropBox,
    canIngest,
    canAnalyzeData,
    canExportData,
    canQueryData,
    canViewRuns,
    canViewPermissions,
  } = managerPermissions.permissions;

  const menuItems = [
    {
      url: "/data/manager/projects",
      style: { marginLeft: "4px" },
      text: "Projects and Datasets",
      disabled: !canManageProjectsDatasets,
    },
    { url: "/data/manager/files", text: "Drop Box", disabled: !canViewDropBox },
    {
      url: "/data/manager/ingestion",
      text: "Ingestion",
      // TODO: more advanced permissions for this (workflow-level checks)
      disabled: !canIngest,
    },
    {
      url: "/data/manager/analysis",
      text: "Analysis",
      // TODO: more advanced permissions for this (workflow-level checks)
      disabled: !canAnalyzeData,
    },
    {
      url: "/data/manager/export",
      text: "Export",
      // TODO: more advanced permissions for this (workflow-level checks)
      disabled: !canExportData,
    },
    {
      url: "/data/manager/runs",
      text: "Workflow Runs",
      // TODO: check if we have any viewRuns in any grant, not just on RESOURCE_EVERYTHING
      disabled: !canViewRuns,
    },
    {
      url: "/data/manager/drs",
      text: "DRS Objects",
      // TODO: allow always, when we have object-level permissions on the front end for DRS.
      disabled: !canQueryData,
    },
    {
      url: "/data/manager/access",
      text: "Access Management",
      // TODO: check if we have any viewPermissions in any grant, not just on RESOURCE_EVERYTHING
      disabled: !canViewPermissions,
    },
  ];

  return (
    <>
      <SitePageHeader
        title="Admin › Data Manager"
        withTabBar={true}
        footer={
          <Menu
            mode="horizontal"
            style={styles.menu}
            selectedKeys={matchingMenuKeys(menuItems)}
            items={menuItems.map(transformMenuItem)}
          />
        }
      />
      <Suspense
        fallback={
          <div style={styles.suspenseFallback}>
            <Skeleton active />
          </div>
        }
      >
        <Routes>
          <Route path="projects/*" element={<ManagerProjectDatasetContent />} />
          <Route path="access/*" element={<ManagerAccessContent />} />
          <Route path="files" element={<ManagerDropBoxContent />} />
          <Route path="ingestion" element={<ManagerIngestionContent />} />
          <Route path="analysis" element={<ManagerAnalysisContent />} />
          <Route path="export" element={<ManagerExportContent />} />
          <Route path="drs" element={<ManagerDRSContent />} />
          <Route path="runs/*" element={<ManagerRunsContent />} />
          <Route path="*" element={<Navigate to="projects" replace={true} />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default DataManagerContent;
