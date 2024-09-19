import { type CSSProperties, lazy, Suspense, useCallback, useMemo } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Layout, Menu, Result, Skeleton } from "antd";

import { useBentoService, useBentoServices, useService, useServices } from "@/modules/services/hooks";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import SitePageHeader from "../SitePageHeader";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

const ServiceOverview = lazy(() => import("./ServiceOverview"));

const styles: Record<string, CSSProperties> = {
  // TODO: Deduplicate with data manager
  menu: {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px",
  },
};

const ServiceDetail = () => {
  const navigate = useNavigate();
  const { kind } = useParams();

  const { isFetching: isFetchingServices, hasAttempted: hasAttemptedServices } = useServices();
  const { isFetching: isFetchingBentoServices, hasAttempted: hasAttemptedBentoServices } = useBentoServices();

  const serviceInfo = useService(kind);
  const bentoServiceInfo = useBentoService(kind);

  const menuItems = useMemo(
    () => [{ url: `/services/${kind}/overview`, style: { marginLeft: "4px" }, text: "Overview" }],
    [kind],
  );
  const selectedKeys = matchingMenuKeys(menuItems);

  const onBack = useCallback(() => navigate("/services"), [navigate]);

  const loading = !hasAttemptedServices || !hasAttemptedBentoServices || isFetchingServices || isFetchingBentoServices;
  const didNotLoad = (hasAttemptedServices && !serviceInfo) || (hasAttemptedBentoServices && !bentoServiceInfo);

  // Use non-breaking spaces (\u00a0) to keep the site page header height fixed during loading
  return (
    <>
      <SitePageHeader
        title={serviceInfo?.name || (!hasAttemptedServices ? "\u00a0" : kind)}
        subTitle={serviceInfo?.description || "\u00a0"}
        footer={
          didNotLoad ? undefined : (
            <Menu
              mode="horizontal"
              style={styles.menu}
              selectedKeys={selectedKeys}
              items={menuItems.map(transformMenuItem)}
            />
          )
        }
        withTabBar={true}
        onBack={onBack}
      />
      <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
          {loading ? (
            <Skeleton active={true} />
          ) : didNotLoad ? (
            <Result
              status="error"
              title="Could not get service information"
              subTitle={`Make sure the service registry and the ${kind} service are running.`}
            />
          ) : (
            <Suspense fallback={<Skeleton active={true} />}>
              <Routes>
                <Route
                  path="overview"
                  element={<ServiceOverview serviceInfo={serviceInfo} bentoServiceInfo={bentoServiceInfo} />}
                />
                <Route path="/" element={<Navigate to="overview" replace={true} />} />
              </Routes>
            </Suspense>
          )}
        </Layout.Content>
      </Layout>
    </>
  );
};

export default ServiceDetail;
