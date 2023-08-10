import {objectWithoutProp} from "../../utils/misc";

import {
    LOADING_ALL_SERVICE_DATA,

    FETCH_BENTO_SERVICES,
    FETCH_SERVICES,

    FETCH_SERVICE_DATA_TYPES,
    LOADING_SERVICE_DATA_TYPES,

    FETCH_SERVICE_DATA_TYPES_BY_DATASET,
    LOADING_SERVICE_DATA_TYPES_BY_DATASET,

    FETCH_SERVICE_TABLES,
    LOADING_SERVICE_TABLES,

    ADDING_SERVICE_TABLE,
    DELETING_SERVICE_TABLE,

    FETCH_SERVICE_WORKFLOWS,
    LOADING_SERVICE_WORKFLOWS,
} from "./actions";
import {normalizeServiceInfo} from "../../utils/serviceInfo";


export const bentoServices = (
    state = {
        isFetching: false,
        itemsByArtifact: {},
        itemsByKind: {},
    },
    action,
) => {
    switch (action.type) {
        case FETCH_BENTO_SERVICES.REQUEST:
            return {...state, isFetching: true};
        case FETCH_BENTO_SERVICES.RECEIVE:
            if (Array.isArray(action.data)) {
                // Handle old CHORD services format
                // TODO: Remove when no longer relevant
                console.warn("The old chord_services.json format will be deprecated soon.");
                const byArtifact = Object.fromEntries(action.data.map(s => [s.type.artifact, s]));
                return {
                    ...state,
                    itemsByArtifact: byArtifact,
                    itemsByKind: byArtifact,  // technically wrong but only rarely; deprecated code to be removed
                };
            }

            // Handle the new Bento services format: an object with the docker-compose service ID as the key
            return {
                ...state,
                itemsByArtifact: Object.fromEntries(Object.entries(action.data).map(([composeID, service]) => ([
                    service.artifact,
                    {...service, composeID},
                ]))),
                itemsByKind: Object.fromEntries(Object.entries(action.data).map(([composeID, service]) => ([
                    service.service_kind ?? service.artifact,
                    {...service, composeID},
                ]))),
            };
        case FETCH_BENTO_SERVICES.FINISH:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const services = (
    state = {
        isFetching: false,
        isFetchingAll: false,  // TODO: Rename this, since it means more "all data including other stuff"
        items: [],
        itemsByID: {},
        itemsByArtifact: {},
        itemsByKind: {},

        aggregationService: null,
        dropBoxService: null,
        eventRelay: null,
        metadataService: null,
        notificationService: null,
        wesService: null,
    },
    action,
) => {
    switch (action.type) {
        case LOADING_ALL_SERVICE_DATA.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_ALL_SERVICE_DATA.END:
        case LOADING_ALL_SERVICE_DATA.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICES.REQUEST:
            return {...state, isFetching: true};

        case FETCH_SERVICES.RECEIVE: {
            // Filter out services without a valid serviceInfo.type & normalize service infos across spec versions:
            const items = action.data.filter(s => s?.type).map(normalizeServiceInfo);
            const itemsByID = Object.fromEntries(items.map(s => [s.id, s]));
            const itemsByKind = Object.fromEntries(items.map(s => [s.bento?.serviceKind ?? s.type.artifact, s]));
            const itemsByArtifact = Object.fromEntries(items.map(s => [s.type.artifact, s]));

            return {
                ...state,

                items,
                itemsByID,
                itemsByKind,
                itemsByArtifact,

                // Backwards-compatibility with older Bento versions, where this was called 'federation'
                aggregationService: itemsByKind["aggregation"] ?? itemsByKind["federation"] ?? null,
                dropBoxService: itemsByKind["drop-box"] ?? null,
                drsService: itemsByKind["drs"] ?? null,
                eventRelay: itemsByKind["event-relay"] ?? null,
                notificationService: itemsByKind["notification"] ?? null,
                metadataService: itemsByKind["metadata"] ?? null,
                wesService: itemsByKind["wes"] ?? null,

                lastUpdated: action.receivedAt,
            };
        }

        case FETCH_SERVICES.FINISH:
            return {...state, isFetching: false};

        default:
            return state;
    }
};


export const serviceDataTypes = (
    state = {
        isFetchingAll: false,
        isFetchingItemsByDatasetID: false,
        itemsByID: {},
        dataTypesByServiceID: {},
        dataTypesByServiceArtifact: {},
        dataTypesByServiceKind: {},
        itemsByDatasetID: {},
    },
    action,
) => {
    switch (action.type) {
        case LOADING_SERVICE_DATA_TYPES.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_DATA_TYPES.END:
        case LOADING_SERVICE_DATA_TYPES.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_DATA_TYPES.REQUEST: {
            const {serviceInfo} = action;
            const kind = serviceInfo.bento?.serviceKind ?? serviceInfo.type.artifact;
            return {
                ...state,
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [serviceInfo.id]: {
                        ...(state.dataTypesByServiceID[serviceInfo.id] ?? {items: null, itemsByID: null}),
                        isFetching: true,
                    },
                },
                dataTypesByServiceArtifact: {
                    ...state.dataTypesByServiceArtifact,
                    [serviceInfo.type.artifact]: {
                        ...(state.dataTypesByServiceArtifact[serviceInfo.type.artifact] ??
                            {items: null, itemsByID: null}),
                        isFetching: true,
                    },
                },
                dataTypesByServiceKind: {
                    ...state.dataTypesByServiceKind,
                    [kind]: {
                        ...(state.dataTypesByServiceKind[kind] ?? {items: null, itemsByID: null}),
                        isFetching: true,
                    },
                },
            };
        }

        case FETCH_SERVICE_DATA_TYPES.RECEIVE: {
            const {serviceInfo} = action;
            const artifact = serviceInfo.type.artifact;
            const kind = serviceInfo.bento?.serviceKind ?? artifact;
            const itemsByID = Object.fromEntries(action.data.map(d => [d.id, d]));
            return {
                ...state,
                itemsByID: {
                    ...state.itemsByID,
                    ...itemsByID,
                },
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [serviceInfo.id]: {items: action.data, itemsByID, isFetching: false},
                },
                dataTypesByServiceArtifact: {
                    ...state.dataTypesByServiceArtifact,
                    [artifact]: {items: action.data, itemsByID, isFetching: false},
                },
                dataTypesByServiceKind: {
                    ...state.dataTypesByServiceKind,
                    [kind]: {items: action.data, itemsByID, isFetching: false},
                },
                lastUpdated: action.receivedAt,
            };
        }

        case FETCH_SERVICE_DATA_TYPES.ERROR: {
            const {serviceInfo} = action;
            const artifact = serviceInfo.type.artifact;
            const kind = serviceInfo.bento?.serviceKind ?? artifact;
            return {
                ...state,
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [action.serviceID]: {
                        ...(state.dataTypesByServiceID[serviceInfo.id] ?? {items: null, itemsByID: null}),
                        isFetching: false,
                    },
                },
                dataTypesByServiceArtifact: {
                    ...state.dataTypesByServiceArtifact,
                    [artifact]: {
                        ...(state.dataTypesByServiceArtifact[artifact] ?? {items: null, itemsByID: null}),
                        isFetching: false,
                    },
                },
                dataTypesByServiceKind: {
                    ...state.dataTypesByServiceArtifact,
                    [kind]: {
                        ...(state.dataTypesByServiceArtifact[kind] ?? {items: null, itemsByID: null}),
                        isFetching: false,
                    },
                },
            };
        }

        // Handle itemsByDatasetID
        case LOADING_SERVICE_DATA_TYPES_BY_DATASET.BEGIN:
            return {...state, isFetchingItemsByDatasetID: true};

        case LOADING_SERVICE_DATA_TYPES_BY_DATASET.END:
        case LOADING_SERVICE_DATA_TYPES_BY_DATASET.TERMINATE:
            return {...state, isFetchingItemsByDatasetID: false};

        case FETCH_SERVICE_DATA_TYPES_BY_DATASET.RECEIVE: {
            const { datasetID, data } = action;
            const existingItems = state.itemsByDatasetID[datasetID] || [];
            return {
                ...state,
                itemsByDatasetID: {
                    ...state.itemsByDatasetID,
                    [datasetID]: [...existingItems, ...data],
                },
            };
        }

        case FETCH_SERVICE_DATA_TYPES_BY_DATASET.ERROR: {
            const {datasetID} = action;
            return {
                ...state,
                itemsByDatasetID: {
                    ...state.itemsByDatasetID,
                    [datasetID]: {
                        ...(state.itemsByDatasetID[datasetID] || {items: null}),
                        isFetching: false,
                    },
                },
            };
        }

        default:
            return state;
    }
};


export const serviceTables = (
    state = {
        isFetchingAll: false,
        isCreating: false,
        isDeleting: false,
        items: [],
        itemsByServiceID: {},
    },
    action,
) => {
    switch (action.type) {
        case LOADING_SERVICE_TABLES.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_TABLES.END:
        case LOADING_SERVICE_TABLES.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_TABLES.REQUEST: {
            const {serviceInfo} = action;
            return {
                ...state,
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [serviceInfo.id]: {
                        ...(state.itemsByServiceID[serviceInfo.id] ?? {}),
                        isFetching: true,
                    },
                },
            };
        }

        case FETCH_SERVICE_TABLES.RECEIVE: {
            const {serviceInfo: {id: serviceID}, data, dataTypeID} = action;

            const newTables = data.map(t => ({
                ...t,
                service_id: serviceID,
                data_type: dataTypeID,
            })).filter(t =>
                !(state.itemsByServiceID[serviceID]?.tablesByID ?? {}).hasOwnProperty(t.id));

            return {
                ...state,
                items: [...state.items, ...newTables],
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [serviceID]: {
                        ...(state.itemsByServiceID[serviceID] ?? {}),
                        isFetching: false,
                        tables: [
                            ...(state.itemsByServiceID[serviceID]?.tables ?? []),
                            ...data,
                        ],
                        tablesByID: {
                            ...(state.itemsByServiceID[serviceID]?.tablesByID ?? {}),
                            ...Object.fromEntries(newTables.map(t => [t.id, t])),
                        },
                    },
                },
            };
        }

        case FETCH_SERVICE_TABLES.ERROR: {
            const {serviceInfo: {id: serviceID}} = action;
            return {
                ...state,
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [serviceID]: {
                        ...(state.itemsByServiceID[serviceID] ?? {}),
                        isFetching: false,
                    },
                },
            };
        }

        case ADDING_SERVICE_TABLE.BEGIN:
            return {...state, isCreating: true};

        case ADDING_SERVICE_TABLE.END: {
            const {serviceInfo: {id: serviceID}, table} = action;
            return {
                ...state,
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [serviceID]: {
                        ...(state.itemsByServiceID[serviceID] ?? {}),
                        tables: [...(state.itemsByServiceID[serviceID]?.tables ?? []), table],
                        tablesByID: {
                            ...(state.itemsByServiceID[serviceID]?.tablesByID ?? {}),
                            [table.id]: table,
                        },
                    },
                },
            };
        }

        case ADDING_SERVICE_TABLE.TERMINATE:
            return {...state, isCreating: false};

        case DELETING_SERVICE_TABLE.BEGIN:
            return {...state, isDeleting: true};

        case DELETING_SERVICE_TABLE.END: {
            const {serviceInfo: {id: serviceID}, tableID} = action;
            return {
                ...state,
                isDeleting: false,
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [serviceID]: {
                        ...(state.itemsByServiceID[serviceID] ?? {}),
                        tables: (state.itemsByServiceID[serviceID]?.tables ?? [])
                            .filter(t => t.id !== tableID),
                        tablesByID: objectWithoutProp(
                            (state.itemsByServiceID[serviceID]?.tablesByID ?? {}),
                            tableID,
                        ),
                    },
                },
            };
        }

        case DELETING_SERVICE_TABLE.TERMINATE:
            return {...state, isDeleting: false};

        default:
            return state;
    }
};

export const serviceWorkflows = (
    state = {
        isFetchingAll: false,
        workflowsByServiceID: {},
    },
    action,
) => {
    switch (action.type) {
        case LOADING_SERVICE_WORKFLOWS.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_WORKFLOWS.END:
        case LOADING_SERVICE_WORKFLOWS.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_WORKFLOWS.REQUEST: {
            const {serviceInfo: {id: serviceID}} = action;
            return {
                ...state,
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [serviceID]: {
                        isFetching: true,
                        ...(state.workflowsByServiceID[serviceID] ?? {workflows: null}),
                    },
                },
            };
        }

        case FETCH_SERVICE_WORKFLOWS.RECEIVE: {
            const {serviceInfo: {id: serviceID}, data} = action;
            return {
                ...state,
                isFetching: false,
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [serviceID]: {isFetching: false, workflows: data},
                },
            };
        }

        case FETCH_SERVICE_WORKFLOWS.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};
