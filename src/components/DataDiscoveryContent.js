import React, { useEffect, Suspense, lazy } from "react";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";

import { Card, Layout, Skeleton } from "antd";

import { SITE_NAME } from "../constants";
import { withBasePath } from "../utils/url";

import SitePageHeader from "./SitePageHeader";

const DiscoverySearchContent = lazy(() =>
    import("./discovery/DiscoverySearchContent")
);
const DiscoveryDatasetContent = lazy(() =>
    import("./discovery/DiscoveryDatasetContent")
);

const DataDiscoveryContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Discover Data`;
    }, []);

    return (
        <>
            <SitePageHeader
                title="Datasets"
                subTitle="Federated, censored dataset search"
            />
            <Layout>
                <Layout.Content
                    style={{ background: "white", padding: "24px" }}
                >
                    <Suspense
                        fallback={
                            <Card>
                                <Skeleton />
                            </Card>
                        }
                    >
                        <Switch>
                            <Route
                                exact
                                path={withBasePath("data/sets/search")}
                                component={DiscoverySearchContent}
                            />
                            <Route
                                exact
                                path={withBasePath("data/sets/:dataset")}
                                component={DiscoveryDatasetContent}
                            />
                            <Redirect
                                from={withBasePath("data/sets")}
                                to={withBasePath("data/sets/search")}
                            />
                        </Switch>
                    </Suspense>
                </Layout.Content>
            </Layout>
        </>
    );
};

export default withRouter(DataDiscoveryContent);
