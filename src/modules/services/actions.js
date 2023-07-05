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

export const ADDING_SERVICE_TABLE = createFlowActionTypes("ADDING_SERVICE_TABLE");
export const DELETING_SERVICE_TABLE = createFlowActionTypes("DELETING_SERVICE_TABLE");

export const FETCH_SERVICE_WORKFLOWS = createNetworkActionTypes("FETCH_SERVICE_WORKFLOWS");
export const LOADING_SERVICE_WORKFLOWS = createFlowActionTypes("LOADING_SERVICE_WORKFLOWS");

export const FETCH_SERVICE_DATA_TYPES_BY_DATASET = createNetworkActionTypes("FETCH_SERVICE_DATA_TYPES_BY_DATASET");
export const LOADING_SERVICE_DATA_TYPES_BY_DATASET = createFlowActionTypes("LOADING_SERVICE_DATA_TYPES_BY_DATASET");


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

export const fetchDataServiceDataTypesById = networkAction((serviceInfo, datasetID) => ({
    types:  FETCH_SERVICE_DATA_TYPES_BY_DATASET,
    params: {serviceInfo, datasetID},
    url: `${serviceInfo.url}/data-types?dataset=${encodeURIComponent(datasetID)}`,
    err: `Error fetching data types from service '${serviceInfo.name}'`,
}));

export const fetchDataServiceDataTypeTables = networkAction((serviceInfo, dataType) => ({
    types: FETCH_SERVICE_TABLES,
    params: {serviceInfo, dataTypeID: dataType.id},
    url: `${serviceInfo.url}/tables?${createURLSearchParams({"data-type": dataType.id}).toString()}`,
    err: `Error fetching tables from service '${serviceInfo.name}' (data type ${dataType.id})`,
}));

export const fetchDataServiceWorkflows = networkAction((serviceInfo) => ({
    types: FETCH_SERVICE_WORKFLOWS,
    params: {serviceInfo},
    url: `${serviceInfo.url}/workflows`,
}));


export const fetchServicesWithMetadataAndDataTypesAndTables = (onServiceFetchFinish) => async (dispatch, getState) => {
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
        // add here the logic for fetching data types by dataset
    ]);

    // Fetch Data Service Local Tables
    // - skip services that don't provide data or don't have data types
    dispatch(beginFlow(LOADING_SERVICE_TABLES));
    await Promise.all(dataServicesInfo.flatMap(s =>
        (getState().serviceDataTypes.dataTypesByServiceID[s.id]?.items ?? [])
            .map(dt => dispatch(fetchDataServiceDataTypeTables(s, dt)))));
    dispatch(endFlow(LOADING_SERVICE_TABLES));

    dispatch(endFlow(LOADING_ALL_SERVICE_DATA));
};

export const fetchServicesByDataset = () => async (dispatch, getState) => {
    dispatch(beginFlow(LOADING_SERVICE_DATA_TYPES_BY_DATASET));
    const datasetIdentifiers = Object.values(getState().projects.itemsByID).flatMap(
        project => project.datasets?.map(d => d.identifier) || []);

    const dataServicesInfo = getState().services.items.filter(s => s?.type).map(s => {
        const serviceKind = s.bento?.serviceKind ?? s.type.artifact;
        return {
            ...s,
            bentoService: getState().bentoServices.itemsByKind[serviceKind] ?? null,
        };
    }).filter(s => s.bentoService?.data_service ?? false);

    if (datasetIdentifiers.length > 0 && dataServicesInfo.length > 0) {
        await Promise.all(dataServicesInfo.flatMap(s =>
            datasetIdentifiers.map(id => dispatch(fetchDataServiceDataTypesById(s, id))),
        ));
    }

    dispatch(endFlow(LOADING_SERVICE_DATA_TYPES_BY_DATASET));
};


export const fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded = (onServiceFetchFinish) =>
    (dispatch, getState) => {
        const state = getState();
        if ((Object.keys(state.bentoServices.itemsByArtifact).length === 0 || state.services.items.length === 0 ||
                Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0) &&
                !state.services.isFetchingAll) {
            return dispatch(fetchServicesWithMetadataAndDataTypesAndTables(onServiceFetchFinish));
        }
    };
