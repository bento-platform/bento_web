import { combineReducers } from "redux";

import { user } from "./modules/user/reducers";
import { drs } from "./modules/drs/reducers";
import { discovery } from "./modules/discovery/reducers";
import { explorer } from "./modules/explorer/reducers";
import { projects, biosamples, individuals, overviewSummary } from "./modules/metadata/reducers";
import { manager, dropBox } from "./modules/manager/reducers";
import { notifications } from "./modules/notifications/reducers";
import { bentoServices, services, serviceDataTypes, serviceWorkflows } from "./modules/services/reducers";
import { datasetDataTypes, datasetResources, datasetSummaries } from "./modules/datasets/reducers";
import { runs } from "./modules/wes/reducers";

import openIdConfiguration from "./lib/auth/redux/openIdConfigSlice";
import auth from "./lib/auth/redux/authSlice";

const rootReducer = combineReducers({
    // Auth module
    auth,
    openIdConfiguration,
    user,

    // DRS module
    drs,

    // Discovery module
    discovery,

    // Explorer module
    explorer,

    // Metadata module
    projects,

    biosamples,
    individuals,
    overviewSummary,

    // Manager module
    manager,
    dropBox,

    // Notifications module
    notifications,

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
