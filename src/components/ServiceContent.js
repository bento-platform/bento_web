import { useEffect } from "react";

import { Col, Layout, Row, Spin, Statistic, Typography } from "antd";

import SitePageHeader from "./SitePageHeader";
import ServiceList from "./ServiceList";

import { SITE_NAME } from "@/constants";
import { EM_DASH } from "@/constants";
import { BENTO_URL } from "@/config";
import { useProjects } from "@/modules/metadata/hooks";
import { useAppSelector } from "@/store";

const ServiceContent = () => {
  useEffect(() => {
    document.title = `${SITE_NAME}: Admin / Services`;
  }, []);

  const { items: projects, isFetching: isFetchingProjects } = useProjects();
  const isFetching = useAppSelector((state) => state.user.isFetchingDependentData) || isFetchingProjects;

  return (
    <>
      <SitePageHeader title="Admin › Services" subTitle="Node status and health monitor" />
      <Layout>
        <Layout.Content style={{ background: "white", padding: "32px 24px 4px" }}>
          <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
            <Col lg={24} xl={12}>
              <Statistic title="Node URL" value={BENTO_URL} />
            </Col>
            <Col md={12} lg={8} xl={3}>
              <Spin spinning={isFetching}>
                <Statistic title="Projects" value={isFetching ? EM_DASH : projects.length} />
              </Spin>
            </Col>
            <Col md={12} lg={8} xl={3}>
              <Spin spinning={isFetching}>
                <Statistic title="Datasets" value={isFetching ? EM_DASH : projects.flatMap((p) => p.datasets).length} />
              </Spin>
            </Col>
          </Row>
          <Typography.Title level={3}>Services</Typography.Title>
          <ServiceList />
        </Layout.Content>
      </Layout>
    </>
  );
};

export default ServiceContent;
