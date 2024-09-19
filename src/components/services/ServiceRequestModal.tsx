import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuthorizationHeader } from "bento-auth-js";

import { Button, Divider, Form, Input, Modal, Skeleton } from "antd";

import { useBentoServices } from "@/modules/services/hooks";
import type { JSONType } from "@/types/json";

import JsonDisplay from "../display/JsonDisplay";

type ServiceRequestModalProps = {
  service?: string;
  onCancel?: () => void;
};

const ServiceRequestModal = ({ service, onCancel }: ServiceRequestModalProps) => {
  const bentoServicesByKind = useBentoServices().itemsByKind;
  const serviceUrl = useMemo(() => bentoServicesByKind[service]?.url, [bentoServicesByKind, service]);

  const [requestPath, setRequestPath] = useState<string>("service-info");
  const [requestLoading, setRequestLoading] = useState<boolean>(false);
  const [requestData, setRequestData] = useState<JSONType | string>(null);
  const [requestIsJSON, setRequestIsJSON] = useState<boolean>(false);

  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

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
    (e: FormEvent<HTMLFormElement>) => {
      performRequestModalGet();
      e.preventDefault();
    },
    [performRequestModalGet],
  );

  return (
    <Modal
      open={service !== undefined}
      title={`${service}: make a request`}
      footer={null}
      width={960}
      onCancel={onCancel}
    >
      <Form layout="inline" style={{ display: "flex" }} onSubmitCapture={formSubmit}>
        <Form.Item style={{ flex: 1 }} wrapperCol={{ span: 24 }}>
          <Input
            addonBefore={(serviceUrl ?? "ERROR") + "/"}
            value={requestPath}
            disabled={!hasAttempted || requestLoading}
            onChange={(e) => setRequestPath(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={requestLoading} style={{ marginTop: -2 }}>
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

export default ServiceRequestModal;
