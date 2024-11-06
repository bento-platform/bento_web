import { combineReducers } from "redux";

import { AuthReducer as auth, OIDCReducer as openIdConfiguration } from "bento-auth-js";

import { allPermissions, grants, groups } from "./modules/authz/reducers";
import { dropBox } from "@/modules/dropBox/reducers";
import { drs } from "./modules/drs/reducers";
import { explorer, igvGenomes } from "./modules/explorer/reducers";
import { projects, biosamples, individuals, discovery } from "./modules/metadata/reducers";
import { manager } from "./modules/manager/reducers";
import { notifications } from "./modules/notifications/reducers";
import { referenceGenomes } from "./modules/reference/reducers";
import { bentoServices, services, serviceDataTypes, serviceWorkflows } from "./modules/services/reducers";
import { datasetDataTypes, datasetResources, datasetSummaries } from "./modules/datasets/reducers";
import { user } from "./modules/user/reducers";
import { runs } from "./modules/wes/reducers";

const rootReducer = combineReducers({
  // Auth module
  auth,
  openIdConfiguration,
  user,

  // Authz module
  allPermissions,
  grants,
  groups,

  // Discovery module
  discovery,

  // Drop box module
  dropBox,

  // DRS module
  drs,

  // Explorer module
  explorer,
  igvGenomes,

  // Metadata module
  projects,

  biosamples,
  individuals,

  // Manager module
  manager,

  // Notifications module
  notifications,

  // Reference module
  referenceGenomes,

  // Services module
  bentoServices,
  services,
  serviceDataTypes,
  serviceWorkflows,

  // Dataset module
  datasetDataTypes,
  datasetSummaries,
  datasetResources,

  // WES module
  runs,
});

export default rootReducer;
