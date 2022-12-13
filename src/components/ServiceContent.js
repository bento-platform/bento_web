import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { Col, Layout, Row, Spin, Statistic, Typography } from "antd";

import SitePageHeader from "./SitePageHeader";
import ServiceList from "./ServiceList";

import { SITE_NAME } from "../constants";
import { EM_DASH } from "../constants";

const ServiceContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME}: Admin / Services`;
    }, []);

    const nodeInfo = useSelector((state) => state.nodeInfo.data);
    const isFetchingNodeInfo = useSelector((state) => state.nodeInfo.isFetching);
    const projects = useSelector((state) => state.projects.items);
    const isFetchingProjects = useSelector((state) => state.auth.isFetchingDependentData || state.projects.isFetching);

    return (
        <>
            <SitePageHeader title="Admin › Services" subTitle="Node status and health monitor" />
            <Layout>
                <Layout.Content style={{ background: "white", padding: "32px 24px 4px" }}>
                    <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                        <Col lg={24} xl={12}>
                            <Spin spinning={isFetchingNodeInfo}>
                                <Statistic title="Node URL" value={isFetchingNodeInfo ? EM_DASH : nodeInfo.CHORD_URL} />
                            </Spin>
                        </Col>
                        <Col md={12} lg={8} xl={3}>
                            <Spin spinning={isFetchingProjects}>
                                <Statistic title="Projects" value={isFetchingProjects ? EM_DASH : projects.length} />
                            </Spin>
                        </Col>
                        <Col md={12} lg={8} xl={3}>
                            <Spin spinning={isFetchingProjects}>
                                <Statistic
                                    title="Datasets"
                                    value={isFetchingProjects ? EM_DASH : projects.flatMap((p) => p.datasets).length}
                                />
                            </Spin>
                        </Col>
                        {/* TODO: Tables */}
                    </Row>
                    <Typography.Title level={3}>Services</Typography.Title>
                    <ServiceList />
                </Layout.Content>
            </Layout>
        </>
    );
};

export default ServiceContent;
