import {message} from "antd";

import {FEDERATION_MODE} from "../../settings";
import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_PEERS = createNetworkActionTypes("FETCH_PEERS");
const fetchPeers = networkAction(() => (dispatch, getState) => ({
    types: FETCH_PEERS,
    url: `${getState().services.federationService.url}/peers`,
    err: "Error fetching peers"
}));

export const fetchPeersOrError = () => async dispatch => {
    if (!FEDERATION_MODE) {
        // If federation mode is off, nothing related to peers will be
        // accessible anyway, so don't bother trying to fetch any data.
        return;
    }

    try {
        return await dispatch(fetchPeers());
    } catch (e) {
        // Possibly federationService is null
        message.error("Error fetching peers");
        console.error(e);
    }
};
