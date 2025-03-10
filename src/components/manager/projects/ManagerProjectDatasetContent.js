import { useCallback, useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Button, Empty, Layout, Menu, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";

import { createProject, RESOURCE_EVERYTHING } from "bento-auth-js";

import ForbiddenContent from "@/components/ForbiddenContent";
import ServiceError from "@/components/common/ServiceError";
import ProjectCreationModal from "./ProjectCreationModal";
import ProjectSkeleton from "./ProjectSkeleton";
import RoutedProject from "./RoutedProject";

import { useHasResourcePermissionWrapper } from "@/hooks";
import { fetchProjectsWithDatasets, invalidateProjects } from "@/modules/metadata/actions";
import { useProjects } from "@/modules/metadata/hooks";
import { toggleProjectCreationModal as toggleProjectCreationModalAction } from "@/modules/manager/actions";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";
import { useServices } from "@/modules/services/hooks";
import { useCanManageAtLeastOneProjectOrDataset } from "@/modules/authz/hooks";
import { useAppDispatch, useAppSelector } from "@/store";

const styles = {
  projectHelpText: {
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  sidebar: { background: "white" },
  sidebarInner: { display: "flex", height: "100%", flexDirection: "column" },
  sidebarMenu: { flex: 1, paddingTop: "8px" },
  sidebarButtonContainer: { display: "flex", borderRight: "1px solid #e8e8e8", padding: "24px", gap: 16 },
  sidebarAddProjectButton: { flex: "100%" },
  sidebarRefreshButton: { width: 46 },
};

const ManagerProjectDatasetContent = () => {
  const dispatch = useAppDispatch();

  const managePerms = useCanManageAtLeastOneProjectOrDataset();
  const {
    hasPermission: canManageProjectsDatasets,
    isFetching: fetchingManagePermissions,
    hasAttempted: attemptedManagePermissions,
  } = managePerms;

  const { hasPermission: canCreateProject, fetchingPermission: fetchingCanCreateProject } =
    useHasResourcePermissionWrapper(RESOURCE_EVERYTHING, createProject);

  const { items, isFetching: isFetchingProjects } = useProjects();
  const { isFetchingDependentData } = useAppSelector((state) => state.user);

  const { metadataService, isFetchingAll: isFetchingAllServices } = useServices();

  const projectMenuItems = useMemo(
    () =>
      items.map((project) => ({
        url: `/data/manager/projects/${project.identifier}`,
        text: project.title,
      })),
    [items],
  );

  const toggleProjectCreationModal = useCallback(() => dispatch(toggleProjectCreationModalAction()), [dispatch]);
  const refreshProjects = useCallback(() => {
    dispatch(invalidateProjects());
    dispatch(fetchProjectsWithDatasets());
  }, [dispatch]);

  if (attemptedManagePermissions && !fetchingManagePermissions && !canManageProjectsDatasets) {
    return (
      <ForbiddenContent
        message="You do not have permission to view the project/dataset manager."
        debugState={managePerms}
      />
    );
  }

  if (!isFetchingDependentData && projectMenuItems.length === 0) {
    if (!isFetchingAllServices && metadataService === null) {
      return (
        <Layout>
          <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <ServiceError service="metadata" />
          </Layout.Content>
        </Layout>
      );
    }

    return (
      <>
        <ProjectCreationModal />
        <Layout>
          <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false}>
              <Typography.Title level={3}>No Projects</Typography.Title>
              <Typography.Paragraph style={styles.projectHelpText}>
                To create datasets and ingest data, you have to create a Bento project first. Bento projects have a name
                and description, and let you group related datasets together. You can then specify project-wide consent
                codes and data use restrictions to control data access.
              </Typography.Paragraph>
              <Button type="primary" icon={<PlusOutlined />} onClick={toggleProjectCreationModal}>
                Create Project
              </Button>
            </Empty>
          </Layout.Content>
        </Layout>
      </>
    );
  }

  return (
    <>
      {canCreateProject && <ProjectCreationModal />}
      <Layout>
        <Layout.Sider style={styles.sidebar} width={256} breakpoint="lg" collapsedWidth={0}>
          <div style={styles.sidebarInner}>
            <Menu
              style={styles.sidebarMenu}
              mode="inline"
              selectedKeys={matchingMenuKeys(projectMenuItems)}
              items={projectMenuItems.map(transformMenuItem)}
            />
            <div style={styles.sidebarButtonContainer}>
              <Button
                type="primary"
                style={styles.sidebarAddProjectButton}
                onClick={toggleProjectCreationModal}
                loading={fetchingCanCreateProject || isFetchingDependentData}
                disabled={!canCreateProject || isFetchingDependentData}
                icon={<PlusOutlined />}
              >
                Create Project
              </Button>
              <Button
                icon={<ReloadOutlined />}
                style={styles.sidebarRefreshButton}
                onClick={refreshProjects}
                loading={isFetchingProjects}
              />
            </div>
          </div>
        </Layout.Sider>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
          {/* TODO: Fix project datasets */}
          {projectMenuItems.length > 0 ? (
            <Routes>
              <Route path=":project" element={<RoutedProject />} />
              <Route path="/" element={<Navigate to={`${items[0].identifier}`} replace={true} />} />
            </Routes>
          ) : isFetchingDependentData ? (
            <ProjectSkeleton />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Select a project from the menu on the left to manage it."
            />
          )}
        </Layout.Content>
      </Layout>
    </>
  );
};

export default ManagerProjectDatasetContent;
