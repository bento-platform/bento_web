import React, {useCallback, useEffect, useMemo, useState} from "react";
import { useParams } from "react-router-dom";

import { List, Button, Col, Layout, Row, Skeleton, Typography } from "antd";

import JsonView from "@/components/common/JsonView";
import { useBentoService } from "@/modules/services/hooks";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

const TITLE_STYLE = { marginTop: 0 };

const ServiceLogs = () => {
    const { kind } = useParams();

    // change dis laterrr
    const lokiUrl = "http://localhost:3100/loki/api/v1/query_range?";
    const dummyData = ["hello", "lol", "bowl"];

    // make request path more modular
    const [requestPath, setRequestPath] = useState(`query={container="bentov2-public"}`);
    const [requestData, setRequestData] = useState(null);
    const [requestLoading, setRequestLoading] = useState(false);
    const [hasAttempted, setHasAttempted] = useState(false);
    // await doesn't work?
    const bentoServiceInfo = useBentoService(kind);


    const performDockerLogsGet = useCallback(() => {
        if (!lokiUrl) {
            setRequestData(null);
            return;
        }
        (async () => {
            setRequestLoading(true);

            try {
                const res = await fetch(`${lokiUrl}query={container="bentov2-${bentoServiceInfo.composeID}"}`);
                const data = await res.json();
                setRequestData(data.data.result[0].values.map((val) => val[1]));
            } finally {
                setRequestLoading(false);
            }
        })();

    }, [lokiUrl, requestPath, kind]);

    useEffect(() => {
        if (!hasAttempted) {
            performDockerLogsGet();
            setHasAttempted(true);
        }
    }, [hasAttempted, performDockerLogsGet]);

    const formSubmit = useCallback(e => {
        performDockerLogsGet();
        e.preventDefault();
    }, [performDockerLogsGet]);


    if (requestLoading) return <Skeleton />;
    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Row>
                    <Col span={12}>
                        <Typography.Title level={4} style={TITLE_STYLE}>Logs</Typography.Title>
                        <List 
                            dataSource={requestData ?? []} 
                            loading={requestLoading} 
                            renderItem={(item) => <List.Item>{item}</List.Item>
                            }></List>
                    </Col>
                </Row>
                <Button
                    type="primary"
                    htmlFor="submit"
                    loading={requestLoading}
                    onClick={formSubmit}
                    style={{ marginTop: -2 }}
                >GET</Button>
            </Layout.Content>
        </Layout>
    );
};

export default ServiceLogs;
