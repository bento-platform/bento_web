import { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Layout, Menu, Skeleton } from "antd";

import { useDatasetsArray, useProjectsArray } from "@/modules/metadata/hooks";
import { useAppSelector } from "@/store";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import ExplorerDatasetSearch from "./ExplorerDatasetSearch";
import SitePageHeader from "../SitePageHeader";

const ExplorerSearchContent = () => {
  const projects = useProjectsArray();
  const { isFetchingDependentData } = useAppSelector((state) => state.user);

  const menuItems = useMemo(
    () =>
      projects.map((project) => ({
        // url: `/data/explorer/projects/${project.identifier}`,
        key: project.identifier,
        text: project.title,
        children: project.datasets.map((dataset) => ({
          url: `/data/explorer/search/${dataset.identifier}`,
          text: dataset.title,
        })),
      })),
    [projects],
  );

  const datasets = useDatasetsArray();

  return (
    <>
      <SitePageHeader title="Data Explorer" />
      <Layout>
        <Layout.Sider style={{ background: "white" }} width={256} breakpoint="lg" collapsedWidth={0}>
          <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
            <Menu
              mode="inline"
              style={{ flex: 1, paddingTop: "8px" }}
              defaultOpenKeys={menuItems.map((p) => p.key)}
              selectedKeys={matchingMenuKeys(menuItems)}
              items={menuItems.map(transformMenuItem)}
            />
          </div>
        </Layout.Sider>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
          {datasets.length > 0 ? (
            <Routes>
              <Route path=":dataset" element={<ExplorerDatasetSearch />} />
              <Route path="/" element={<Navigate to={`${datasets[0].identifier}`} replace={true} />} />
            </Routes>
          ) : isFetchingDependentData ? (
            <Skeleton />
          ) : (
            "No datasets available"
          )}
        </Layout.Content>
      </Layout>
    </>
  );
};

export default ExplorerSearchContent;
