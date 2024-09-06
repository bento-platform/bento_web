// import { createNetworkActionTypes, networkAction } from "@/utils/actions";

// export const FETCH_DISCOVERY_SCHEMA = createNetworkActionTypes("FETCH_DISCOVERY_SCHEMA");
// export const FETCH_DATS_SCHEMA = createNetworkActionTypes("FETCH_DATS_SCHEMA");

// const _fetchDiscoverySchema = networkAction(() => (dispatch, getState) => ({
//   types: FETCH_DISCOVERY_SCHEMA,
//   url: `${getState().bentoServices.itemsByKind.metadata.url}/api/schemas/discovery`,
//   err: "Error fetching discovery JSON schema",
// }));

// export const fetchDiscoverySchema = () => (dispatch, getState) => {
//   const metadataUrl = getState()?.bentoServices?.itemsByKind?.metadata?.url;
//   if (!metadataUrl) return Promise.resolve();
//   return dispatch(_fetchDiscoverySchema());
// };
