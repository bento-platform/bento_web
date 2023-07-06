import {BENTO_PUBLIC_URL} from "../../config";

import {
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,

    beginFlow,
    endFlow,
    terminateFlow,
} from "../../utils/actions";

import {createURLSearchParams} from "../../utils/requests";


/**
 * @typedef {Object} BentoService
 * @property {string} artifact
 * @property {string} url
 * @property {boolean} data_service
 * @property {?boolean} manageable_tables
 */


export const LOADING_ALL_SERVICE_DATA = createFlowActionTypes("LOADING_ALL_SERVICE_DATA");

export const FETCH_BENTO_SERVICES = createNetworkActionTypes("FETCH_BENTO_SERVICES");
export const FETCH_SERVICES = createNetworkActionTypes("FETCH_SERVICES");

export const FETCH_SERVICE_DATA_TYPES = createNetworkActionTypes("FETCH_SERVICE_DATA_TYPES");
export const LOADING_SERVICE_DATA_TYPES = createFlowActionTypes("LOADING_SERVICE_DATA_TYPES");

export const FETCH_SERVICE_TABLES = createNetworkActionTypes("FETCH_SERVICE_TABLES");
export const LOADING_SERVICE_TABLES = createFlowActionTypes("LOADING_SERVICE_TABLES");

export const FETCH_SERVICE_DATASETS = createNetworkActionTypes("FETCH_SERVICE_DATASETS");
export const LOADING_SERVICE_DATASETS = createFlowActionTypes("LOADING_SERVICE_DATASETS");

export const ADDING_SERVICE_TABLE = createFlowActionTypes("ADDING_SERVICE_TABLE");
export const DELETING_SERVICE_TABLE = createFlowActionTypes("DELETING_SERVICE_TABLE");

export const FETCH_SERVICE_WORKFLOWS = createNetworkActionTypes("FETCH_SERVICE_WORKFLOWS");
export const LOADING_SERVICE_WORKFLOWS = createFlowActionTypes("LOADING_SERVICE_WORKFLOWS");


export const endAddingServiceTable = (serviceInfo, dataTypeID, table) => ({
    type: ADDING_SERVICE_TABLE.END,
    serviceInfo,
    dataTypeID,
    table,
});


export const endDeletingServiceTable = (serviceInfo, dataTypeID, tableID) => ({
    type: DELETING_SERVICE_TABLE.END,
    serviceInfo,
    dataTypeID,
    tableID,
});


export const fetchBentoServices = networkAction(() => ({
    types: FETCH_BENTO_SERVICES,
    url: `${BENTO_PUBLIC_URL}/api/service-registry/bento-services`,
    err: "Error fetching Bento services list",
}));

export const fetchServices = networkAction(() => ({
    types: FETCH_SERVICES,
    url: `${BENTO_PUBLIC_URL}/api/service-registry/services`,
    err: "Error fetching services",
}));

export const fetchDataServiceDataTypes = networkAction((serviceInfo) => ({
    types: FETCH_SERVICE_DATA_TYPES,
    params: {serviceInfo},
    url: `${serviceInfo.url}/data-types`,
    err: `Error fetching data types from service '${serviceInfo.name}'`,
}));

export const fetchDataServiceWorkflows = networkAction((serviceInfo) => ({
    types: FETCH_SERVICE_WORKFLOWS,
    params: {serviceInfo},
    url: `${serviceInfo.url}/workflows`,
}));


// TODO: remove tables
export const fetchServicesWithMetadataAndDataTypes = (onServiceFetchFinish) => async (dispatch, getState) => {
    dispatch(beginFlow(LOADING_ALL_SERVICE_DATA));

    // Fetch Services
    await Promise.all([dispatch(fetchBentoServices()), dispatch(fetchServices())]);
    if (!getState().services.items) {
        // Something went wrong, terminate early
        dispatch(terminateFlow(LOADING_ALL_SERVICE_DATA));
        return;
    }

    // Fetch other data (need metadata first):

    // - Skip services that don't provide data (i.e. no data types/workflows/etc.)

    const dataServicesInfo = getState().services.items.filter(s => s?.type).map(s => {
        // Backwards compatibility for:
        // - old type ("group:artifact:version")
        // - and new  ({"group": "...", "artifact": "...", "version": "..."})
        const serviceKind = s.bento?.serviceKind ?? s.type.artifact;
        return {
            ...s,
            bentoService: getState().bentoServices.itemsByKind[serviceKind] ?? null,
        };
    }).filter(s => s.bentoService?.data_service ?? false);

    // - Custom stuff to start - explicitly don't wait for this promise to finish since it runs parallel to this flow.
    if (onServiceFetchFinish) onServiceFetchFinish();

    // - Fetch Data Service Data Types and Workflows
    await Promise.all([
        (async () => {
            dispatch(beginFlow(LOADING_SERVICE_DATA_TYPES));
            await Promise.all(dataServicesInfo.map(s => dispatch(fetchDataServiceDataTypes(s))));
            dispatch(endFlow(LOADING_SERVICE_DATA_TYPES));
        })(),

        (async () => {
            dispatch(beginFlow(LOADING_SERVICE_WORKFLOWS));
            await Promise.all(dataServicesInfo.map(s => dispatch(fetchDataServiceWorkflows(s))));
            dispatch(endFlow(LOADING_SERVICE_WORKFLOWS));
        })(),
    ]);

    dispatch(endFlow(LOADING_ALL_SERVICE_DATA));
};

export const fetchServicesWithMetadataAndDataTypesIfNeeded = (onServiceFetchFinish) =>
    (dispatch, getState) => {
        const state = getState();
        if ((Object.keys(state.bentoServices.itemsByArtifact).length === 0 || state.services.items.length === 0 ||
                Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0) &&
                !state.services.isFetchingAll) {
            return dispatch(fetchServicesWithMetadataAndDataTypes(onServiceFetchFinish));
        }
    };
