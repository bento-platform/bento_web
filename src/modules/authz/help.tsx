import type { ReactNode } from "react";
import {
  analyzeData,
  createDataset,
  createNotifications,
  createProject,
  deleteData,
  deleteDataset,
  deleteDropBox,
  deleteProject,
  deleteReferenceMaterial,
  downloadData,
  editDataset,
  editPermissions,
  editProject,
  exportData,
  ingestData,
  ingestDropBox,
  ingestReferenceMaterial,
  queryData,
  queryDatasetLevelBoolean,
  queryDatasetLevelCounts,
  queryProjectLevelBoolean,
  queryProjectLevelCounts,
  viewDropBox,
  viewNotifications,
  viewPermissions,
  viewRuns,
} from "bento-auth-js";

export const PERMISSIONS_HELP: Record<string, ReactNode> = {
  // data
  [queryData]: "Whether the subject can access data records for the resource, e.g. phenotypic metadata, experiments.",
  [downloadData]:
    "Whether the subject can download data files associated with the resource, e.g., download VCFs and other " +
    "experiment results.",
  [deleteData]: "Whether the subject can delete data from the resource, e.g., clearing all variants.",
  [ingestData]: "Whether the subject can ingest new data into the resource, e.g., adding new biosamples.",
  [analyzeData]: "TODO", // TODO
  [exportData]: "TODO", // TODO

  // dataset
  [editDataset]:
    "Whether the subject can edit datasets (title, description, provenance metadata) in the specified node/project " +
    "resource.",
  [createDataset]: "Whether the subject can create datasets in the specified node/project resource.",
  [deleteDataset]:
    "Whether the subject can delete datasets from the specified node/project resource. This in turn deletes data " +
    "inside the dataset.",

  // dataset_level_boolean
  [queryDatasetLevelBoolean]:
    "Whether the subject can see low-count-censored yes/no answers about the data at the dataset level. The " +
    "low-count threshold is controlled by the resource's discovery configuration file.",

  // dataset_level_counts
  [queryDatasetLevelCounts]:
    "Whether the subject can see low-count-censored count answers about the data at the dataset level. The low-count " +
    "threshold is controlled by the resource's discovery configuration file.",

  // drop_box
  [viewDropBox]:
    "Whether the subject can see the instance-wide drop box (staging area) for files. This permission is only valid " +
    "for the Everything resource.",
  [ingestDropBox]: "Whether the subject can upload files / create folders in the drop box.",
  [deleteDropBox]: "Whether the subject can delete files / folders from the drop box.",

  // notifications
  [viewNotifications]: "TODO", // TODO
  [createNotifications]: "TODO", // TODO

  // permissions
  [viewPermissions]:
    "Whether the subject can view permissions which apply to only this resource, or any sub-resources.",
  [editPermissions]:
    "Whether the subject can edit permissions which apply to only this resource, or any sub-resources.",

  // private_portal
  "view:private_portal": (
    <>
      <strong>LEGACY PERMISSION.</strong> Whether the subject can view the private data portal, as well as POSSIBLY
      SENSITIVE data in services which have not been converted to the new Bento authorization system.
    </>
  ),

  // project
  [editProject]:
    "Whether the subject can edit details about the project: title, description, and other provenance metadata.",
  [createProject]: "Whether the subject can create a new project in the instance.",
  [deleteProject]: "Whether the subject can delete a project from the instance.",

  // project_level_boolean
  [queryProjectLevelBoolean]:
    "Whether the subject can see low-count-censored yes/no answers about the data at the project level. The " +
    "low-count threshold is controlled by the project/instance's discovery configuration file.",

  // project_level_counts
  [queryProjectLevelCounts]:
    "Whether the subject can see low-count-censored count answers about the data at the project level. The low-count " +
    "threshold is controlled by the project/instance's discovery configuration file.",

  // reference_material
  [ingestReferenceMaterial]:
    "Whether the subject can ingest reference material (genomes, genome features) into the instance. Note that any " +
    "reference material ingested is public, and available to anyone including anonymous users.",
  [deleteReferenceMaterial]:
    "Whether the subject can delete reference material (genomes, genome features) from the instance.",

  // runs
  [viewRuns]:
    "Whether the subject can view workflow runs. Currently only works when applied to the Everything resource!",
};
