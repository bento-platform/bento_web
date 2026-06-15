import type { JSONType } from "@/types/json";

export type WorkflowType = "ingestion" | "analysis" | "export";

// TODO: expand def
export type WorkflowInput = {
  id: string;
  required?: boolean;
  type: string;
  help: string;
  injected?: boolean;
  key?: string;
  pattern?: string;
};

export interface Workflow {
  name: string;
  type: WorkflowType;
  description: string;
  file: string;
  data_type?: string | null;
  tags?: string[];
  inputs: WorkflowInput[];
}

export interface ServiceWorkflow extends Workflow {
  service_base_url: string;
}

export type WorkflowRunState =
  | "UNKNOWN"
  | "QUEUED"
  | "INITIALIZING"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETE"
  | "EXECUTOR_ERROR"
  | "SYSTEM_ERROR"
  | "CANCELED"
  | "CANCELING";

export type WorkflowRunRequest = {
  workflow_params: JSONType; // JSON
  workflow_type: "WDL";
  workflow_type_version: string;
  workflow_engine_parameters: JSONType;
  workflow_url: string;
  tags: {
    workflow_id: string;
    workflow_metadata: Workflow;
  };
};

export type WDLValue = string | number | boolean | string[] | number[] | boolean[] | null;

export type WorkflowRunInputs = Record<string, WDLValue>;

export type WorkflowRunOutput = {
  type: string; // WDL / (workflow descriptor language) type
  value: WDLValue;
};

export type WorkflowRunLog = {
  name: string;
  cmd: string;
  start_time: string | null;
  end_time: string | null;
  stdout: string;
  stderr: string;
  exit_code: number | null;
  celery_id: number | null; // Bento-specific extension
};

export interface WorkflowRun {
  run_id: string;
  state: WorkflowRunState;
}

export interface WorkflowRunWithDetails extends WorkflowRun {
  request: WorkflowRunRequest;
  run_log: WorkflowRunLog;
  task_logs: object[]; // not defined yet
  outputs: Record<string, WorkflowRunOutput>;
}

export interface WorkflowRunWithNestedDetails extends WorkflowRun {
  details: WorkflowRunWithDetails | null;
}

export interface WorkflowRunWithNestedDetailsState extends WorkflowRunWithNestedDetails {
  isFetching: boolean;
}

export type WorkflowRunStreamState = {
  isFetching: boolean;
  data: string | null;
};

export type WorkflowRunsState = {
  isFetching: boolean;
  hasAttempted: boolean;
  isSubmittingRun: boolean;
  items: WorkflowRunWithNestedDetailsState[];
  itemsByID: Record<string, WorkflowRunWithNestedDetailsState>;
  streamsByID: {
    stdout?: WorkflowRunStreamState;
    stderr?: WorkflowRunStreamState;
  };
};
