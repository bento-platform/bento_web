import type { Workflow, WorkflowType } from "@/modules/wes/types";

export type GA4GHServiceInfo = {
  id: string;
  name: string;
  description?: string;
  version: string;
  type: {
    group: string;
    artifact: string;
    version: string;
  };

  organization: {
    name: string;
    url: string;
  };
  contactUrl?: string;
  documentationUrl?: string;

  createdAt?: string;
  updatedAt?: string;

  environment: "dev" | "prod";

  url: string; // Only for services inside a service registry

  bento?: {
    serviceKind: string;
    dataService?: boolean;
    workflowProvider?: boolean;
    gitTag?: string;
    gitBranch?: string;
    gitCommit?: string;
    gitRepository?: string;
  };
};

export type BentoService = {
  service_kind: string;
  url_template: string;
  repository: string;
  url: string;
};

export interface BentoServiceWithComposeID extends BentoService {
  composeID: string;
}

export interface BentoDataType {
  id: string;
  label: string;
  queryable: boolean;
  schema: object;
  metadata_schema: object;
  count?: number;
}

export interface BentoServiceDataType extends BentoDataType {
  service_base_url: string;
}

export type WorkflowWithID = Workflow & { id: string };

type WorkflowItems = { items: WorkflowWithID[]; itemsByID: Record<string, WorkflowWithID> };

export type WorkflowsByType = {
  [key in WorkflowType]: WorkflowItems;
};
