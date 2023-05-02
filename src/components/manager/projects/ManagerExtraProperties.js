import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import ProjectSkeleton from "./ProjectSkeleton";
import { Button, Empty, Layout, Menu, Typography } from "antd";
import { matchingMenuKeys, renderMenuItem } from "../../../utils/menu";
import { LAYOUT_CONTENT_STYLE } from "../../../styles/layoutContent";
import { withBasePath } from "../../../utils/url";
import RoutedProjectJsonSchema from "./RoutedProjectJsonSchema";

const ManagerExtraProperties = () => {

    const history = useHistory();

    const projects = useSelector(state => state.projects.items);
    const loadingAuthDependentData = useSelector(state => state.auth.isFetchingDependentData);

    const [projectMenuItems, setProjectMenuItems] = useState([]);

    const navigateToProjects = () => {
        history.push(withBasePath("admin/data/manager/projects/"));
    };

    useEffect(() => {
        setProjectMenuItems(
            projects.map(project => ({
                url: withBasePath(`admin/data/manager/schemas/${project.identifier}`),
                text: project.title
            }))
        );
    }, [projects]);

    return (<>
        <Layout>
            {(!loadingAuthDependentData && projects.length === 0) ? (
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false}>
                        <Typography.Title level={3}>No Projects</Typography.Title>
                        <Typography.Paragraph style={{
                            maxWidth: "600px",
                            marginLeft: "auto",
                            marginRight: "auto"
                        }}>
                            Extra properties schemas are defined for specific projects only,
                            go to the Projects section in order to create one. Come back to create Extra Properties
                            JSON schemas for the new project.
                        </Typography.Paragraph>
                        <Button type="primary" icon="left"
                            onClick={navigateToProjects}>Project Tab</Button>
                    </Empty>
                </Layout.Content>
            ) : <>
                <Layout.Sider style={{ background: "white" }} width={256} breakpoint="lg" collapsedWidth={0}>
                    <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
                        <Menu style={{ flex: 1, paddingTop: "8px" }}
                            mode="inline"
                            selectedKeys={matchingMenuKeys(projectMenuItems)}>
                            {projectMenuItems.map(renderMenuItem)}
                        </Menu>
                        <div style={{ borderRight: "1px solid #e8e8e8", padding: "24px" }}>
                            <Button type="primary" icon="left"
                                onClick={navigateToProjects}>Project Tab</Button>
                        </div>
                    </div>
                </Layout.Sider>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    {projectMenuItems.length > 0 ? (
                        <Switch>
                            <Route path={withBasePath("admin/data/manager/schemas/:project")}
                                component={RoutedProjectJsonSchema} />
                            <Redirect from={withBasePath("admin/data/manager/schemas")}
                                to={withBasePath(`admin/data/manager/schemas/${projects[0].identifier}`)} />
                        </Switch>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                "Select a project from the menu on the" +
                                " left to manage its Extra Properties."
                            } />
                    )}
                </Layout.Content>
            </>}
        </Layout>
    </>);
};

export default ManagerExtraProperties;
