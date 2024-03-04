import React, { Suspense, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch, useHistory, useParams } from "react-router-dom";

import { Menu, Skeleton } from "antd";

import SitePageHeader from "../SitePageHeader";
import ServiceOverview from "./ServiceOverview";

import { matchingMenuKeys, transformMenuItem } from "../../utils/menu";

const styles = {
    // TODO: Deduplicate with data manager
    menu: {
        marginLeft: "-24px",
        marginRight: "-24px",
        marginTop: "-12px",
    },
    suspenseFallback: {
        padding: "24px",
        backgroundColor: "white",
    },
};

const SuspenseFallback = React.memo(() => (
    <div style={styles.suspenseFallback}><Skeleton active /></div>
));

const ServiceDetail = () => {
    // TODO: 404
    const history = useHistory();
    const { kind } = useParams();

    const serviceInfoByKind = useSelector((state) => state.services.itemsByKind);

    const serviceInfo = useMemo(() => serviceInfoByKind[kind], [kind, serviceInfoByKind]);

    const menuItems = useMemo(() => [
        {url: `/admin/services/${kind}/overview`, style: {marginLeft: "4px"}, text: "Overview"},
    ], [kind]);
    const selectedKeys = matchingMenuKeys(menuItems);

    const onBack = useCallback(() => history.push("/admin/services"), [history]);

    return (
        <>
            <SitePageHeader
                title={serviceInfo?.name || ""}
                subTitle={serviceInfo?.description || ""}
                footer={
                    <Menu
                        mode="horizontal"
                        style={styles.menu}
                        selectedKeys={selectedKeys}
                        items={menuItems.map(transformMenuItem)}
                    />
                }
                withTabBar={true}
                onBack={onBack}
            />
            <Suspense fallback={<SuspenseFallback />}>
                <Switch>
                    <Route exact path="/admin/services/:kind/overview" component={ServiceOverview} />
                    <Redirect from={`/admin/services/${kind}`} to={`/admin/services/${kind}/overview`} />
                </Switch>
            </Suspense>
        </>
    );
};

export default ServiceDetail;
