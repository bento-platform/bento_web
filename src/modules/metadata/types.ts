export type ProjectJSONSchema = {
  name: string;
  fields: Record<string, string[]>;
};

export type Dataset = {
  identifier: string;
  title: string;
  description: string;
  contact_info: string;
  dats_file: object;
  additional_resources: string[];

  created: string; // ISO timestamp string
  updated: string; // ISO timestamp string
};

export type Project = {
  identifier: string;
  title: string;
  description: string;

  project_schemas?: ProjectJSONSchema[];
  datasets?: Dataset[];

  created: string; // ISO timestamp string
  updated: string; // ISO timestamp string
};
