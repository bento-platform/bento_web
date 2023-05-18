import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_TABLE_SUMMARY = createNetworkActionTypes("FETCH_TABLE_SUMMARY");

const fetchTableSummary = networkAction((serviceInfo, tableID) => ({
    types: FETCH_TABLE_SUMMARY,
    params: {serviceInfo, tableID},
    url: `${serviceInfo.url}/tables/${tableID}/summary`,  // TODO: Private...
}));

export const fetchTableSummaryIfPossible = (serviceInfo, tableID) => (dispatch, getState) => {
    if (getState().tableSummaries.isFetching) return;
    return dispatch(fetchTableSummary(serviceInfo, tableID));
};
