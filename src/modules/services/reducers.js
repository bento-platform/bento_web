import {
  LOADING_ALL_SERVICE_DATA,
  FETCH_BENTO_SERVICES,
  FETCH_SERVICES,
  FETCH_DATA_TYPES,
  FETCH_WORKFLOWS,
} from "./actions";

export const bentoServices = (
  state = {
    isFetching: false,
    hasAttempted: false,
    itemsByKind: {},
  },
  action,
) => {
  switch (action.type) {
    case FETCH_BENTO_SERVICES.REQUEST:
      return { ...state, isFetching: true };
    case FETCH_BENTO_SERVICES.RECEIVE:
      // Handle the Bento services format: an object with the docker-compose service ID as the key
      return {
        ...state,
        itemsByKind: Object.fromEntries(
          Object.entries(action.data).map(([composeID, service]) => [
            service.service_kind ?? service.artifact,
            { ...service, composeID },
          ]),
        ),
      };
    case FETCH_BENTO_SERVICES.FINISH:
      return { ...state, isFetching: false, hasAttempted: true };

    default:
      return state;
  }
};

export const services = (
  state = {
    isFetching: false,
    hasAttempted: false,
    isFetchingAll: false, // TODO: Rename this, since it means more "all data including other stuff"
    items: [],
    itemsByID: {},
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
      return { ...state, isFetchingAll: true };

    case LOADING_ALL_SERVICE_DATA.END:
    case LOADING_ALL_SERVICE_DATA.TERMINATE:
      return { ...state, isFetchingAll: false };

    case FETCH_SERVICES.REQUEST:
      return { ...state, isFetching: true };

    case FETCH_SERVICES.RECEIVE: {
      // Filter out services without a valid serviceInfo.type:
      const items = action.data.filter((s) => s?.type);
      const itemsByID = Object.fromEntries(items.map((s) => [s.id, s]));
      const itemsByKind = Object.fromEntries(items.map((s) => [s.bento?.serviceKind ?? s.type.artifact, s]));

      return {
        ...state,

        items,
        itemsByID,
        itemsByKind,

        aggregationService: itemsByKind["aggregation"] ?? null,
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
      return { ...state, isFetching: false, hasAttempted: true };

    default:
      return state;
  }
};

export const serviceDataTypes = (
  state = {
    isFetching: false,
    itemsByID: {},
    items: [],
  },
  action,
) => {
  switch (action.type) {
    case FETCH_DATA_TYPES.REQUEST:
      return { ...state, isFetching: true };
    case FETCH_DATA_TYPES.RECEIVE:
      return {
        ...state,
        items: action.data,
        itemsByID: Object.fromEntries(action.data.map((dt) => [dt.id, dt])),
      };
    case FETCH_DATA_TYPES.FINISH:
      return { ...state, isFetching: false };

    default:
      return state;
  }
};

export const serviceWorkflows = (
  state = {
    isFetching: false,
    items: {}, // by purpose and then by workflow ID
  },
  action,
) => {
  switch (action.type) {
    case FETCH_WORKFLOWS.REQUEST:
      return { ...state, isFetching: true };
    case FETCH_WORKFLOWS.RECEIVE:
      return {
        ...state,
        items: action.data,
      };
    case FETCH_WORKFLOWS.FINISH:
      return {
        ...state,
        isFetching: false,
      };

    default:
      return state;
  }
};
