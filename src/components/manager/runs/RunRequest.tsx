import { Descriptions, List, Tag } from "antd";

import JsonView from "@/components/common/JsonView";
import type { JSONType } from "@/types/json";

import type { RunPageProps } from "./types";
import WorkflowListItem from "../WorkflowListItem";

const RunRequest = ({ run }: RunPageProps) => {
  const details = run?.details;

  if (!details) return <div />;

  const runDataType = details.request.tags.workflow_metadata.data_type;

  return (
    <Descriptions bordered>
      {runDataType && (
        <Descriptions.Item label="Run Data Type" span={3}>
          <Tag>{runDataType}</Tag>
        </Descriptions.Item>
      )}
      <Descriptions.Item label="Parameters" span={3}>
        <JsonView src={details.request.workflow_params} collapsed={false} />
      </Descriptions.Item>
      <Descriptions.Item label="Workflow Type">{details.request.workflow_type}</Descriptions.Item>
      <Descriptions.Item label="Workflow Type Version">{details.request.workflow_type_version}</Descriptions.Item>
      <Descriptions.Item label="Workflow URL">
        <a href={details.request.workflow_url} target="_blank" rel="noopener noreferrer">
          {details.request.workflow_url}
        </a>
      </Descriptions.Item>
      <Descriptions.Item label="Workflow" span={3}>
        <List itemLayout="vertical">
          <WorkflowListItem workflow={details.request.tags.workflow_metadata} style={{ paddingBottom: 0 }} />
        </List>
      </Descriptions.Item>
      <Descriptions.Item label="Tags">
        <JsonView src={details.request.tags as unknown as JSONType} collapsed={false} />
      </Descriptions.Item>
    </Descriptions>
  );
};

export default RunRequest;
