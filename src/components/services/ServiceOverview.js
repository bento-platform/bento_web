import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { Col, Layout, Row, Skeleton, Typography } from "antd";

import ReactJson from "react-json-view";

import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";

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
                        <Typography.Title level={4}>Service Info</Typography.Title>
                        <ReactJson
                            src={serviceInfo ?? {}}
                            displayDataTypes={false}
                            enableClipboard={false}
                            name={null}
                        />
                    </Col>
                    <Col span={12}>
                        <Typography.Title level={4}>Bento Service Configuration</Typography.Title>
                        <ReactJson
                            src={bentoServiceInfo ?? {}}
                            displayDataTypes={false}
                            enableClipboard={false}
                            name={null}
                        />
                    </Col>
                </Row>
            </Layout.Content>
        </Layout>
    );
};

export default ServiceOverview;
