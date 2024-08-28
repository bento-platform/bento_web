import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useAuthorizationHeader } from "bento-auth-js";

import { Button, Divider, Form, Input, Modal, Skeleton } from "antd";

import JsonDisplay from "../display/JsonDisplay";
import { useBentoServices } from "@/modules/services/hooks";

const ServiceRequestModal = ({ service, onCancel }) => {
  const bentoServicesByKind = useBentoServices().itemsByKind;
  const serviceUrl = useMemo(() => bentoServicesByKind[service]?.url, [bentoServicesByKind, service]);

  const [requestPath, setRequestPath] = useState("service-info");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [requestIsJSON, setRequestIsJSON] = useState(false);

  const [hasAttempted, setHasAttempted] = useState(false);

  const authHeader = useAuthorizationHeader();

  const performRequestModalGet = useCallback(() => {
    if (!serviceUrl) {
      setRequestData(null);
      return;
    }
    (async () => {
      setRequestLoading(true);

      const p = requestPath.replace(/^\//, "");
      try {
        const res = await fetch(`${serviceUrl}/${p}`, {
          headers: authHeader,
        });

        if ((res.headers.get("content-type") ?? "").includes("application/json")) {
          const data = await res.json();
          setRequestIsJSON(true);
          setRequestData(data);
        } else {
          const data = await res.text();
          setRequestIsJSON(false);
          setRequestData(data);
        }
      } finally {
        setRequestLoading(false);
        setRequestPath(p); // With starting '/' trimmed off if needed
      }
    })();
  }, [serviceUrl, requestPath, authHeader]);

  useEffect(() => {
    setRequestData(null);
    setRequestIsJSON(false);
    setRequestPath("service-info");
    setHasAttempted(false);
  }, [service]);

  useEffect(() => {
    if (!hasAttempted) {
      performRequestModalGet();
      setHasAttempted(true);
    }
  }, [hasAttempted, performRequestModalGet]);

  const formSubmit = useCallback(
    (e) => {
      performRequestModalGet();
      e.preventDefault();
    },
    [performRequestModalGet],
  );

  return (
    <Modal open={service !== null} title={`${service}: make a request`} footer={null} width={960} onCancel={onCancel}>
      <Form layout="inline" style={{ display: "flex" }} onSubmit={formSubmit}>
        <Form.Item style={{ flex: 1 }} wrapperCol={{ span: 24 }}>
          <Input
            addonBefore={(serviceUrl ?? "ERROR") + "/"}
            value={requestPath}
            disabled={!hasAttempted || requestLoading}
            onChange={(e) => setRequestPath(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlFor="submit"
            loading={requestLoading}
            onClick={formSubmit}
            style={{ marginTop: -2 }}
          >
            GET
          </Button>
        </Form.Item>
      </Form>
      <Divider />
      {requestLoading ? (
        <Skeleton loading={true} />
      ) : requestIsJSON ? (
        <JsonDisplay jsonSrc={requestData} />
      ) : (
        <div style={{ maxWidth: "100%", overflowX: "auto" }}>
          <pre>
            {typeof requestData === "string" || requestData === null ? requestData : JSON.stringify(requestData)}
          </pre>
        </div>
      )}
    </Modal>
  );
};
ServiceRequestModal.propTypes = {
  service: PropTypes.string,
  onCancel: PropTypes.func,
};

export default ServiceRequestModal;
