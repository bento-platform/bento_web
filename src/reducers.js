import {combineReducers} from "redux";

import {auth} from "./modules/auth/reducers";
import {discovery} from "./modules/discovery/reducers";
import {explorer} from "./modules/explorer/reducers";
import {logs} from "./modules/logs/reducers";
import {
    projects,
    projectTables,

    biosamples,
    individuals
} from "./modules/metadata/reducers";
import {manager, dropBox} from "./modules/manager/reducers";
import {nodeInfo} from "./modules/node/reducers";
import {notifications} from "./modules/notifications/reducers";
import {peers} from "./modules/peers/reducers";
import {
    chordServices,
    services,
    serviceDataTypes,
    serviceTables,
    serviceWorkflows
} from "./modules/services/reducers";
import {tableSummaries} from "./modules/tables/reducers";
import {runs} from "./modules/wes/reducers";

const rootReducer = combineReducers({
    // Auth module
    auth,

    // Discovery module
    discovery,

    // Explorer module
    explorer,

    // Logs module
    logs,

    // Metadata module

    projects,
    projectTables,

    biosamples,
    individuals,

    // Manager module
    manager,
    dropBox,

    // Node Information module
    nodeInfo,

    // Notifications module
    notifications,

    // Services module
    chordServices,
    services,
    serviceDataTypes,
    serviceTables,
    serviceWorkflows,

    // Table module
    tableSummaries,

    // WES module
    runs,

    // Peers module
    peers,
});

export default rootReducer;
