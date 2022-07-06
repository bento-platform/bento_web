import React, { useEffect } from "react";
import { Redirect, Switch } from "react-router-dom";
import { BASE_PATH, withBasePath } from "../utils/url";

import { Layout } from "antd";

import OwnerRoute from "./OwnerRoute";
import SitePageHeader from "./SitePageHeader";
import ServiceContent from "./ServiceContent";
import DataManagerContent from "./DataManagerContent";
import PeersContent from "./PeersContent";
import ServiceDetail from "./services/ServiceDetail";

import { SITE_NAME } from "../constants";

const AdminContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Admin`;
    }, []);

    return (
        <>
            <SitePageHeader title="Admin" subTitle="Administrative tools" />
            <Layout>
                <Layout.Content
                    style={{ background: "white", padding: "32px 24px 4px" }}
                >
                    {/* <Typography.Title level={3}>Admin</Typography.Title> */}
                    <Switch>
                        <OwnerRoute
                            path={withBasePath("admin/services")}
                            component={ServiceContent}
                        />
                        <OwnerRoute
                            path={withBasePath("admin/services/:artifact")}
                            component={ServiceDetail}
                        />
                        <OwnerRoute
                            path={withBasePath("admin/data/manager")}
                            component={DataManagerContent}
                        />
                        <OwnerRoute
                            path={withBasePath("admin/peers")}
                            component={PeersContent}
                        />
                        <Redirect
                            from={BASE_PATH}
                            to={withBasePath("admin/services")}
                        />
                    </Switch>
                </Layout.Content>
            </Layout>
        </>
    );
};

export default AdminContent;
