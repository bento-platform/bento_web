import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { Col, Layout, Row, Skeleton, Typography } from "antd";

import JsonView from "@/components/JsonView";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

const TITLE_STYLE = { marginTop: 0 };

const ServiceOverview = () => {
    const { kind } = useParams();

    const serviceInfoByKind = useSelector((state) => state.services.itemsByKind);
    const bentoServicesByKind = useSelector((state) => state.bentoServices.itemsByKind);

    const serviceInfo = useMemo(() => serviceInfoByKind[kind], [kind, serviceInfoByKind]);
    const bentoServiceInfo = useMemo(() => bentoServicesByKind[kind], [kind, bentoServicesByKind]);

    const loading = !(serviceInfo && bentoServiceInfo);

    if (loading) return <Skeleton />;
    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Row>
                    <Col span={12}>
                        <Typography.Title level={4} style={TITLE_STYLE}>Service Info</Typography.Title>
                        <JsonView src={serviceInfo ?? {}} collapsed={false} />
                    </Col>
                    <Col span={12}>
                        <Typography.Title level={4} style={TITLE_STYLE}>Bento Service Configuration</Typography.Title>
                        <JsonView src={bentoServiceInfo ?? {}} collapsed={false} />
                    </Col>
                </Row>
            </Layout.Content>
        </Layout>
    );
};

export default ServiceOverview;
