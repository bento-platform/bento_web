import React, {useCallback, useMemo} from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";

import {Button, Empty, Layout, Menu, Result, Typography} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import ProjectCreationModal from "./ProjectCreationModal";
import ProjectSkeleton from "./ProjectSkeleton";
import RoutedProject from "./RoutedProject";

import {toggleProjectCreationModal as toggleProjectCreationModalAction} from "../../../modules/manager/actions";
import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";
import {matchingMenuKeys, transformMenuItem} from "../../../utils/menu";


const PROJECT_HELP_TEXT_STYLE = {
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
};

const SIDEBAR_STYLE = {background: "white"};
const SIDEBAR_INNER_STYLE = {display: "flex", height: "100%", flexDirection: "column"};
const SIDEBAR_MENU_STYLE = {flex: 1, paddingTop: "8px"};
const SIDEBAR_BUTTON_CONTAINER = {borderRight: "1px solid #e8e8e8", padding: "24px"};
const SIDEBAR_BUTTON_STYLE = {width: "100%"};


const ManagerProjectDatasetContent = () => {
    const dispatch = useDispatch();

    const {items} = useSelector(state => state.projects);
    const {isFetchingDependentData} = useSelector(state => state.user);
    const {metadataService, isFetchingAll: isFetchingAllServices} = useSelector(state => state.services);

    const projectMenuItems = useMemo(() => items.map(project => ({
        url: `/admin/data/manager/projects/${project.identifier}`,
        text: project.title,
    })), [items]);

    const toggleProjectCreationModal = useCallback(
        () => dispatch(toggleProjectCreationModalAction()), [dispatch]);

    if (!isFetchingDependentData && projectMenuItems.length === 0) {
        if (!isFetchingAllServices && metadataService === null) {
            return <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Result
                        status="error"
                        title="Could not contact the metadata service"
                        subTitle="Please contact your Bento node administrator or ensure that all services are running."
                    />
                </Layout.Content>
            </Layout>;
        }

        return  <>
            <ProjectCreationModal />
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false}>
                        <Typography.Title level={3}>No Projects</Typography.Title>
                        <Typography.Paragraph style={PROJECT_HELP_TEXT_STYLE}>
                            To create datasets and ingest data, you have to create a Bento project
                            first. Bento projects have a name and description, and let you group related
                            datasets together. You can then specify project-wide consent codes and data use
                            restrictions to control data access.
                        </Typography.Paragraph>
                        <Button type="primary" icon={<PlusOutlined />} onClick={toggleProjectCreationModal}>
                            Create Project</Button>
                    </Empty>
                </Layout.Content>
            </Layout>
        </>;
    }

    return <>
        <ProjectCreationModal />
        <Layout>
            <Layout.Sider style={SIDEBAR_STYLE} width={256} breakpoint="lg" collapsedWidth={0}>
                <div style={SIDEBAR_INNER_STYLE}>
                    <Menu
                        style={SIDEBAR_MENU_STYLE}
                        mode="inline"
                        selectedKeys={matchingMenuKeys(projectMenuItems)}
                        items={projectMenuItems.map(transformMenuItem)}
                    />
                    <div style={SIDEBAR_BUTTON_CONTAINER}>
                        <Button type="primary"
                                style={SIDEBAR_BUTTON_STYLE}
                                onClick={toggleProjectCreationModal}
                                loading={isFetchingDependentData}
                                disabled={isFetchingDependentData}
                                icon={<PlusOutlined />}>
                            Create Project
                        </Button>
                    </div>
                </div>
            </Layout.Sider>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                {/* TODO: Fix project datasets */}
                {projectMenuItems.length > 0 ? (
                    <Switch>
                        <Route path="/admin/data/manager/projects/:project" component={RoutedProject} />
                        <Redirect from="/admin/data/manager/projects"
                                  to={`/admin/data/manager/projects/${items[0].identifier}`} />
                    </Switch>
                ) : (
                    isFetchingDependentData ? (
                        <ProjectSkeleton />
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                               description="Select a project from the menu on the left to manage it." />
                    )
                )}
            </Layout.Content>
        </Layout>
    </>;
};

export default ManagerProjectDatasetContent;
