import {
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,

    beginFlow,
    endFlow,
    terminateFlow,
} from "../../utils/actions";

import {createURLSearchParams} from "../../utils/requests";
import {withBasePath} from "../../utils/url";


/**
 * @typedef {Object} CHORDService
 * @property {string} artifact
 * @property {string} url
 * @property {boolean} data_service
 * @property {?boolean} manageable_tables
 */


export const LOADING_ALL_SERVICE_DATA = createFlowActionTypes("LOADING_ALL_SERVICE_DATA");

export const FETCH_CHORD_SERVICES = createNetworkActionTypes("FETCH_CHORD_SERVICES");
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


export const fetchCHORDServices = networkAction(() => ({
    types: FETCH_CHORD_SERVICES,
    url: withBasePath("api/service-registry/chord-services"),
    err: "Error fetching CHORD services",
}));

export const fetchServices = networkAction(() => ({
    types: FETCH_SERVICES,
    url: withBasePath("api/service-registry/services"),
    err: "Error fetching services",
}));

export const fetchDataServiceDataTypes = networkAction((serviceInfo) => ({
    types: FETCH_SERVICE_DATA_TYPES,
    params: {serviceInfo},
    url: `${serviceInfo.url}/data-types`,
    err: `Error fetching data types from service '${serviceInfo.name}'`,
}));

// TODO: remove
export const fetchDataServiceDataTypeDatasets = networkAction((serviceInfo, dataType) => ({
    types: FETCH_SERVICE_DATASETS,
    params: {serviceInfo, dataTypeID: dataType.id},
    url: `${serviceInfo.url}/datasets?${createURLSearchParams({"data-type": dataType.id}).toString()}`,
    err: `Error fetching datasets from service '${serviceInfo.name}' (data type ${dataType.id})`,
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
    await Promise.all([dispatch(fetchCHORDServices()), dispatch(fetchServices())]);
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
            chordService: getState().chordServices.itemsByKind[serviceKind] ?? null,
        };
    }).filter(s => s.chordService?.data_service ?? false);

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

    // Fetch Data Service Local Tables
    // - skip services that don't provide data or don't have data types
    // dispatch(beginFlow(LOADING_SERVICE_TABLES));
    // await Promise.all(dataServicesInfo.flatMap(s =>
    //     (getState().serviceDataTypes.dataTypesByServiceID[s.id]?.items ?? [])
    //         .map(dt => dispatch(fetchDataServiceDataTypeTables(s, dt)))));
    // dispatch(endFlow(LOADING_SERVICE_TABLES));

    dispatch(beginFlow(LOADING_SERVICE_DATASETS));
    await Promise.all(dataServicesInfo.flatMap(s =>
        (getState().serviceDataTypes.dataTypesByServiceID[s.id]?.items ?? [])
            .map(dt => dispatch(fetchDataServiceDataTypeDatasets(s, dt)))));
    dispatch(endFlow(LOADING_SERVICE_DATASETS));

    dispatch(endFlow(LOADING_ALL_SERVICE_DATA));
};

export const fetchServicesWithMetadataAndDataTypesIfNeeded = (onServiceFetchFinish) =>
    (dispatch, getState) => {
        const state = getState();
        if ((Object.keys(state.chordServices.itemsByArtifact).length === 0 || state.services.items.length === 0 ||
                Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0) &&
                !state.services.isFetchingAll) {
            return dispatch(fetchServicesWithMetadataAndDataTypes(onServiceFetchFinish));
        }
    };
