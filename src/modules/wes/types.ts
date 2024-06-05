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
