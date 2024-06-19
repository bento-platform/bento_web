export type GA4GHServiceInfo = {
  id: string;
  name: string;
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

  environment: "dev" | "prod";
  url: string;

  bento?: {
    serviceKind: string;
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
