import {objectWithoutProp} from "../../utils/misc";

import {
    LOADING_ALL_SERVICE_DATA,

    FETCH_CHORD_SERVICES,
    FETCH_SERVICES,

    FETCH_SERVICE_DATA_TYPES,
    LOADING_SERVICE_DATA_TYPES,

    FETCH_SERVICE_TABLES,
    LOADING_SERVICE_TABLES,

    ADDING_SERVICE_TABLE,
    DELETING_SERVICE_TABLE,

    FETCH_SERVICE_WORKFLOWS,
    LOADING_SERVICE_WORKFLOWS
} from "./actions";


export const chordServices = (
    state = {
        isFetching: false,
        itemsByArtifact: {},
    },
    action
) => {
    switch (action.type) {
        case FETCH_CHORD_SERVICES.REQUEST:
            return {...state, isFetching: true};
        case FETCH_CHORD_SERVICES.RECEIVE:
            return {...state, itemsByArtifact: action.data};
        case FETCH_CHORD_SERVICES.FINISH:
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

        aggregationService: null,
        dropBoxService: null,
        eventRelay: null,
        metadataService: null,
        notificationService: null,
        wesService: null,
    },
    action
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
            // Filter out services without a valid serviceInfo.type
            const itemsByArtifact = Object.fromEntries(
                action.data
                    .filter(s => s?.type)
                    .map(s => {
                        // Backwards compatibility for:
                        // - old type ("group:artifact:version")
                        // - and new  ({"group": "...", "artifact": "...", "version": "..."})

                        let serviceType = s.type;
                        if (typeof serviceType === "string") {
                            const [group, artifact, version] = serviceType.split(":");
                            serviceType = {
                                group,
                                artifact,
                                version,
                            };
                        }

                        return [serviceType.artifact, {...s, type: serviceType}];
                    }));
            return {
                ...state,

                items: action.data,
                itemsByID: Object.fromEntries(action.data.map(s => [s.id, s])),
                itemsByArtifact,

                // Backwards-compatibility with older Bento versions, where this was called 'federation'
                aggregationService: itemsByArtifact["aggregation"] ?? itemsByArtifact["federation"] ?? null,
                dropBoxService: itemsByArtifact["drop-box"] ?? null,
                eventRelay: itemsByArtifact["event-relay"] ?? null,
                notificationService: itemsByArtifact["notification"] ?? null,
                metadataService: itemsByArtifact["metadata"] ?? null,
                wesService: itemsByArtifact["wes"] ?? null,

                lastUpdated: action.receivedAt
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
        itemsByID: {},
        dataTypesByServiceID: {},
        dataTypesByServiceArtifact: {},
    },
    action
) => {
    switch (action.type) {
        case LOADING_SERVICE_DATA_TYPES.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_DATA_TYPES.END:
        case LOADING_SERVICE_DATA_TYPES.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_DATA_TYPES.REQUEST: {
            const {serviceInfo} = action;
            return {
                ...state,
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [serviceInfo.id]: {
                        ...(state.dataTypesByServiceID[serviceInfo.id] ?? {items: null, itemsByID: null}),
                        isFetching: true
                    }
                },
                dataTypesByServiceArtifact: {
                    ...state.dataTypesByServiceArtifact,
                    [serviceInfo.type.artifact]: {
                        ...(state.dataTypesByServiceArtifact[serviceInfo.type.artifact] ??
                            {items: null, itemsByID: null}),
                        isFetching: true
                    }
                }
            };
        }

        case FETCH_SERVICE_DATA_TYPES.RECEIVE: {
            const {serviceInfo} = action;
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
                    [serviceInfo.type.artifact]: {items: action.data, itemsByID, isFetching: false},
                },
                lastUpdated: action.receivedAt
            };
        }

        case FETCH_SERVICE_DATA_TYPES.ERROR: {
            const {serviceInfo} = action;
            return {
                ...state,
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [action.serviceID]: {
                        ...(state.dataTypesByServiceID[serviceInfo.id] ?? {items: null, itemsByID: null}),
                        isFetching: false,
                    }
                },
                dataTypesByServiceArtifact: {
                    ...state.dataTypesByServiceArtifact,
                    [action.serviceID]: {
                        ...(state.dataTypesByServiceArtifact[serviceInfo.type.artifact]
                            ?? {items: null, itemsByID: null}),
                        isFetching: false,
                    }
                }
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
    action
) => {
    switch (action.type) {
        case LOADING_SERVICE_TABLES.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_TABLES.END:
        case LOADING_SERVICE_TABLES.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_TABLES.REQUEST:
            return {
                ...state,
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [action.serviceInfo.id]: {
                        ...(state.itemsByServiceID[action.serviceInfo.id] ?? {}),
                        isFetching: true,
                    }
                },
            };

        case FETCH_SERVICE_TABLES.RECEIVE: {
            const newTables = action.data.map(t => ({
                ...t,
                service_id: action.serviceInfo.id,
                data_type: action.dataTypeID
            })).filter(t =>
                !(state.itemsByServiceID[action.serviceInfo.id]?.tablesByID ?? {}).hasOwnProperty(t.id));

            return {
                ...state,
                items: [...state.items, ...newTables],
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [action.serviceInfo.id]: {
                        ...(state.itemsByServiceID[action.serviceInfo.id] ?? {}),
                        isFetching: false,
                        tables: [
                            ...(state.itemsByServiceID[action.serviceInfo.id]?.tables ?? []),
                            ...action.data,
                        ],
                        tablesByID: {
                            ...(state.itemsByServiceID[action.serviceInfo.id]?.tablesByID ?? {}),
                            ...Object.fromEntries(newTables.map(t => [t.id, t]))
                        },
                    }
                },
            };
        }

        case FETCH_SERVICE_TABLES.ERROR:
            return {
                ...state,
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [action.serviceInfo.id]: {
                        ...(state.itemsByServiceID[action.serviceInfo.id] ?? {}),
                        isFetching: false,
                    }
                },
            };

        case ADDING_SERVICE_TABLE.BEGIN:
            return {...state, isCreating: true};

        case ADDING_SERVICE_TABLE.END:
            return {
                ...state,
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [action.serviceInfo.id]: {
                        ...(state.itemsByServiceID[action.serviceInfo.id] ?? {}),
                        tables: [...(state.itemsByServiceID[action.serviceInfo.id]?.tables ?? []), action.table],
                        tablesByID: {
                            ...(state.itemsByServiceID[action.serviceInfo.id]?.tablesByID ?? {}),
                            [action.table.id]: action.table,
                        },
                    },
                }
            };

        case ADDING_SERVICE_TABLE.TERMINATE:
            return {...state, isCreating: false};

        case DELETING_SERVICE_TABLE.BEGIN:
            return {...state, isDeleting: true};

        case DELETING_SERVICE_TABLE.END:
            return {
                ...state,
                itemsByServiceID: {
                    ...state.itemsByServiceID,
                    [action.serviceInfo.id]: {
                        ...(state.itemsByServiceID[action.serviceInfo.id] ?? {}),
                        tables: (state.itemsByServiceID[action.serviceInfo.id]?.tables ?? [])
                            .filter(t => t.id !== action.tableID),
                        tablesByID: objectWithoutProp(
                            (state.itemsByServiceID[action.serviceInfo.id]?.tablesByID ?? {}),
                            action.tableID
                        ),
                    },
                },
            };

        case DELETING_SERVICE_TABLE.TERMINATE:
            return {...state, isDeleting: false};

        default:
            return state;
    }
};

export const serviceWorkflows = (
    state = {
        isFetchingAll: false,
        workflowsByServiceID: {}
    },
    action
) => {
    switch (action.type) {
        case LOADING_SERVICE_WORKFLOWS.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_WORKFLOWS.END:
        case LOADING_SERVICE_WORKFLOWS.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_WORKFLOWS.REQUEST:
            return {
                ...state,
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [action.serviceInfo.id]: {
                        isFetching: true,
                        ...(state.workflowsByServiceID[action.serviceInfo.id] ?? {workflows: null})
                    }
                }
            };

        case FETCH_SERVICE_WORKFLOWS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [action.serviceInfo.id]: {isFetching: false, workflows: action.data}
                }
            };

        case FETCH_SERVICE_WORKFLOWS.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};
