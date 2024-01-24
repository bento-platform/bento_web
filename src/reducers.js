import { combineReducers } from "redux";

import {AuthReducer as auth, OIDCReducer as openIdConfiguration} from "bento-auth-js";

import {drs} from "./modules/drs/reducers";
import {discovery} from "./modules/discovery/reducers";
import { explorer, igvGenomes } from "./modules/explorer/reducers";
import {
    projects,

    biosamples,
    individuals,

    overviewSummary,
} from "./modules/metadata/reducers";
import {manager, dropBox} from "./modules/manager/reducers";
import {notifications} from "./modules/notifications/reducers";
import { referenceGenomes } from "./modules/reference/reducers";
import {
    bentoServices,
    services,
    serviceDataTypes,
    serviceWorkflows,
} from "./modules/services/reducers";
import {datasetDataTypes, datasetResources, datasetSummaries} from "./modules/datasets/reducers";
import { user } from "./modules/user/reducers";
import {runs} from "./modules/wes/reducers";

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
    igvGenomes,

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
