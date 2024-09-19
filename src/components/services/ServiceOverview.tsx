import type { CSSProperties } from "react";

import { Col, Row, Typography } from "antd";

import JsonView from "@/components/common/JsonView";
import type { BentoService, GA4GHServiceInfo } from "@/modules/services/types";

const TITLE_STYLE: CSSProperties = { marginTop: 0 };

type ServiceOverviewProps = {
  serviceInfo: GA4GHServiceInfo;
  bentoServiceInfo: BentoService;
};

const ServiceOverview = ({ serviceInfo, bentoServiceInfo }: ServiceOverviewProps) => {
  return (
    <Row>
      <Col span={12}>
        <Typography.Title level={4} style={TITLE_STYLE}>
          Service Info
        </Typography.Title>
        <JsonView src={serviceInfo} collapsed={false} />
      </Col>
      <Col span={12}>
        <Typography.Title level={4} style={TITLE_STYLE}>
          Bento Service Configuration
        </Typography.Title>
        <JsonView src={bentoServiceInfo} collapsed={false} />
      </Col>
    </Row>
  );
};

export default ServiceOverview;
