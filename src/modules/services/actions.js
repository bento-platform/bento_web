import {BENTO_PUBLIC_URL} from "../../config";

import {
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,

    beginFlow,
    endFlow,
    terminateFlow,
} from "../../utils/actions";

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

export const fetchDataTypes = networkAction(() => ({
    types: FETCH_DATA_TYPES,
    url: `${BENTO_PUBLIC_URL}/api/service-registry/data-types`,
    err: "Error fetching data types",
}));

export const fetchWorkflows = networkAction(() => ({
    types: FETCH_WORKFLOWS,
    url: `${BENTO_PUBLIC_URL}/api/service-registry/workflows`,
    err: "Error fetching workflows",
}));


export const fetchServicesWithMetadataAndDataTypes = (onServiceFetchFinish) => async (dispatch, getState) => {
    dispatch(beginFlow(LOADING_ALL_SERVICE_DATA));

    // Fetch Services
    await Promise.all([
        (async () => {
            await Promise.all([
                dispatch(fetchBentoServices()),
                dispatch(fetchServices()),
            ]);
            // - Custom stuff to start
            //    - explicitly don't wait for this promise to finish since it runs parallel to this flow.
            if (onServiceFetchFinish) onServiceFetchFinish();
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

export const fetchServicesWithMetadataAndDataTypesIfNeeded = (onServiceFetchFinish) =>
    (dispatch, getState) => {
        const state = getState();
        if ((Object.keys(state.bentoServices.itemsByArtifact).length === 0 || state.services.items.length === 0 ||
                state.serviceDataTypes.items.length === 0) && !state.services.isFetchingAll) {
            return dispatch(fetchServicesWithMetadataAndDataTypes(onServiceFetchFinish));
        }
    };
