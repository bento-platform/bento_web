import type { DatasetModel, ProjectScopedDatasetModel } from "@/types/dataset";

// Re-exported so consumers (e.g. GrantForm) can import Dataset from this module.
export type { ProjectScopedDatasetModel };
export type Dataset = ProjectScopedDatasetModel;

export type ProjectJSONSchema = {
  id?: string;
  schema_type?: string;
  name: string;
  fields: Record<string, string[]>;
  project?: string;
};

export type Project = {
  identifier: string;
  title: string;
  description: string;

  project_schemas?: ProjectJSONSchema[];
  datasets?: DatasetModel[];

  created: string; // ISO timestamp string
  updated: string; // ISO timestamp string
};
