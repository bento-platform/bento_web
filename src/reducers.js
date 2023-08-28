import { combineReducers } from "redux";

import { drs } from "./modules/drs/reducers";
import { discovery } from "./modules/discovery/reducers";
import { explorer } from "./modules/explorer/reducers";
import { projects, projectTables, biosamples, individuals, overviewSummary } from "./modules/metadata/reducers";
import { manager, dropBox } from "./modules/manager/reducers";
import { notifications } from "./modules/notifications/reducers";
import {
    bentoServices,
    services,
    serviceDataTypes,
    serviceTables,
    serviceWorkflows,
} from "./modules/services/reducers";
import { tableSummaries } from "./modules/tables/reducers";
import { runs } from "./modules/wes/reducers";

import openIdConfiguration from "./lib/auth/src/redux/openIdConfigSlice";
import auth from "./lib/auth/src/redux/authSlice";

import { user } from "./modules/user/reducers";

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
    projectTables,

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
    serviceTables,
    serviceWorkflows,

    // Table module
    tableSummaries,

    // WES module
    runs,
});

export default rootReducer;
