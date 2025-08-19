import { type CSSProperties, ReactElement, useMemo, useState } from "react";
import { useIsAuthenticated } from "bento-auth-js";

import { Link } from "react-router-dom";

import { Table, Typography, Tag, Button, type TableColumnsType, type TagProps } from "antd";

import { BranchesOutlined, GithubOutlined } from "@ant-design/icons";

import ServiceRequestModal from "./services/ServiceRequestModal";
import { useBentoServices, useServices } from "@/modules/services/hooks";
import { BentoServiceWithComposeID, GA4GHServiceInfo } from "@/modules/services/types";

const SERVICE_KIND_STYLING: CSSProperties = { fontFamily: "monospace" };

type ServiceTag = {
  color?: TagProps["color"];
  logo: ReactElement | null;
  value?: string;
};

// noinspection JSUnresolvedFunction
const getServiceTags = (serviceInfo: GA4GHServiceInfo): ServiceTag[] =>
  [
    {
      color: (serviceInfo.environment ?? "") === "prod" ? "green" : "blue",
      logo: null,
      value: serviceInfo.environment ? serviceInfo.environment.toUpperCase() : undefined,
    },
    {
      color: serviceInfo.bento?.gitCommit ? "blue" : "green",
      logo: null,
      value: serviceInfo.environment ? (serviceInfo.bento?.gitCommit ? "LOCAL" : "PRE-BUILT") : undefined,
    },
    // {color: null, logo: <Icon type="tag"/>, value: ({repository}) => `${repository.split("@")[1]}`},
    {
      logo: <GithubOutlined />,
      value: serviceInfo.bento?.gitTag,
    },
    {
      logo: <BranchesOutlined />,
      value: (() => {
        const { bento } = serviceInfo;

        const branch = bento?.gitBranch;
        const commit = bento?.gitCommit;

        if (!branch || !commit) return undefined;

        return `${branch}:${commit.substring(0, 7)}`;
      })(),
    },
  ].filter((t) => t.value);

const GitInfo = ({ tag, key }: { tag: ServiceTag; key: number }) => (
  <Tag key={key} color={tag.color}>
    {tag.logo} {tag.value}
  </Tag>
);

type ServiceColumn = BentoServiceWithComposeID & {
  key: string;
  serviceInfo: GA4GHServiceInfo | null;
  status: {
    status: boolean;
    dataService: boolean;
  };
  loading: boolean;
};

const serviceColumns = (
  isAuthenticated: boolean,
  setRequestModalService: (kind: string | undefined) => void,
): TableColumnsType<ServiceColumn> => [
  {
    title: "Kind",
    dataIndex: "service_kind",
    render: (serviceKind) =>
      serviceKind ? (
        isAuthenticated ? (
          <Link style={SERVICE_KIND_STYLING} to={`/services/${serviceKind}`}>
            {serviceKind}
          </Link>
        ) : (
          <span style={SERVICE_KIND_STYLING}>{serviceKind}</span>
        )
      ) : null,
  },
  {
    title: "Name",
    dataIndex: ["serviceInfo", "name"],
  },
  {
    title: "Version",
    dataIndex: ["serviceInfo", "version"],
    render: (version, record) => {
      const { serviceInfo } = record;
      return serviceInfo ? (
        <>
          <Typography.Text style={{ marginRight: "1em" }}>{version || "-"}</Typography.Text>
          {getServiceTags(serviceInfo).map((tag, i) => (
            <GitInfo tag={tag} key={i} />
          ))}
        </>
      ) : null;
    },
  },
  {
    title: "Status",
    dataIndex: "status",
    render: ({ status, dataService }, service) =>
      service.loading ? (
        <Tag>LOADING</Tag>
      ) : (
        [
          <Tag key="1" color={status ? "green" : "red"}>
            {status ? "HEALTHY" : "ERROR"}
          </Tag>,
          dataService ? (
            <Tag key="2" color="blue">
              DATA SERVICE
            </Tag>
          ) : null,
        ]
      ),
  },
  {
    title: "Actions",
    render: (service) => {
      const onClick = () => setRequestModalService(service.serviceInfo?.bento?.serviceKind ?? service.key ?? undefined);
      return (
        <Button size="small" onClick={onClick}>
          Make Request
        </Button>
      );
    },
  },
];

const ServiceList = () => {
  const [requestModalService, setRequestModalService] = useState<string | undefined>(undefined);

  const { isFetching: servicesFetching, itemsByKind: servicesByKind } = useServices();
  const { isFetching: bentoServicesFetching, itemsByKind: bentoServicesByKind } = useBentoServices();

  const dataSource = useMemo<ServiceColumn[]>(
    () =>
      Object.entries(bentoServicesByKind).map(([kind, service]) => {
        const serviceInfo = servicesByKind[kind] ?? null;
        return {
          ...service,
          key: kind,
          serviceInfo,
          status: {
            status: kind in servicesByKind,
            dataService: serviceInfo?.bento?.dataService ?? false,
          },
          loading: servicesFetching,
        };
      }),
    [servicesByKind, bentoServicesByKind, servicesFetching],
  );

  const isAuthenticated: boolean = useIsAuthenticated();

  const columns = useMemo(() => serviceColumns(isAuthenticated, setRequestModalService), [isAuthenticated]);

  const isLoading = servicesFetching || bentoServicesFetching;

  return (
    <>
      <ServiceRequestModal service={requestModalService} onCancel={() => setRequestModalService(undefined)} />
      <Table<ServiceColumn>
        bordered
        style={{ marginBottom: 24 }}
        size="middle"
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        pagination={false}
        loading={isLoading}
      />
    </>
  );
};

export default ServiceList;
