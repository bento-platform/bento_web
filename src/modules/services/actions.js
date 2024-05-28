import {BENTO_PUBLIC_URL} from "@/config";

import {
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,

    beginFlow,
    endFlow,
    terminateFlow,
} from "@/utils/actions";

/**
 * @typedef {Object} BentoService
 * @property {string} artifact
 * @property {string} url
 */


export const LOADING_ALL_SERVICE_DATA = createFlowActionTypes("LOADING_ALL_SERVICE_DATA");

export const FETCH_BENTO_SERVICES = createNetworkActionTypes("FETCH_BENTO_SERVICES");
export const FETCH_SERVICES = createNetworkActionTypes("FETCH_SERVICES");
export const FETCH_DATA_TYPES = createNetworkActionTypes("FETCH_DATA_TYPES");
export const FETCH_WORKFLOWS = createNetworkActionTypes("FETCH_WORKFLOWS");

const SERVICE_REGISTRY = `${BENTO_PUBLIC_URL}/api/service-registry`;


export const fetchBentoServices = networkAction(() => ({
    types: FETCH_BENTO_SERVICES,
    check: (state) => !state.bentoServices.isFetching && !Object.keys(state.bentoServices.itemsByKind).length,
    url: `${SERVICE_REGISTRY}/bento-services`,
    err: "Error fetching Bento services list",
}));

export const fetchServices = networkAction(() => ({
    types: FETCH_SERVICES,
    check: (state) => !state.services.isFetching && !state.services.items.length,
    url: `${SERVICE_REGISTRY}/services`,
    err: "Error fetching services",
}));

export const fetchDataTypes = networkAction(() => ({
    types: FETCH_DATA_TYPES,
    check: (state) => !state.serviceDataTypes.isFetching && !state.serviceDataTypes.items.length,
    url: `${SERVICE_REGISTRY}/data-types`,
    err: "Error fetching data types",
}));

export const fetchWorkflows = networkAction(() => ({
    types: FETCH_WORKFLOWS,
    check: (state) => !state.serviceWorkflows.isFetching && !Object.keys(state.serviceWorkflows.items).length,
    url: `${SERVICE_REGISTRY}/workflows`,
    err: "Error fetching workflows",
}));


export const fetchServicesWithMetadataAndDataTypes = () => async (dispatch, getState) => {
    dispatch(beginFlow(LOADING_ALL_SERVICE_DATA));

    // Fetch Services
    await Promise.all([
        (async () => {
            await Promise.all([
                dispatch(fetchBentoServices()),
                dispatch(fetchServices()),
            ]);
        })(),

        dispatch(fetchDataTypes()),
        dispatch(fetchWorkflows()),
    ]);

    if (!getState().services.items) {
        // Something went wrong, terminate early
        dispatch(terminateFlow(LOADING_ALL_SERVICE_DATA));
        return;
    }

    dispatch(endFlow(LOADING_ALL_SERVICE_DATA));
};

export const fetchServicesWithMetadataAndDataTypesIfNeeded = () =>
    (dispatch, getState) => {
        const state = getState();
        if ((Object.keys(state.bentoServices.itemsByArtifact).length === 0 || state.services.items.length === 0 ||
                state.serviceDataTypes.items.length === 0) && !state.services.isFetchingAll) {
            return dispatch(fetchServicesWithMetadataAndDataTypes());
        }
    };
