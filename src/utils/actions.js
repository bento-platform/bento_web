import fetch from "cross-fetch";

import {message} from "antd";
import "antd/es/message/style/css";


export const basicAction = t => () => ({type: t});

export const createNetworkActionTypes = name => ({
    REQUEST: `${name}.REQUEST`,
    RECEIVE: `${name}.RECEIVE`,
    ERROR: `${name}.ERROR`,
    FINISH: `${name}.FINISH`,
});

export const createFlowActionTypes = name => ({
    BEGIN: `${name}.BEGIN`,
    END: `${name}.END`,
    TERMINATE: `${name}.TERMINATE`,
});


const _unpaginatedNetworkFetch = async (url, req, parse) => {
    const response = await fetch(url, req);
    if (!response.ok) {
        throw `${response.status} ${response.statusText}`;
    }
    return response.status === 204 ? null : await parse(response);
};

const _paginatedNetworkFetch = async (url, req, parse) => {
    const results = [];
    const _fetchNext = async (pageUrl) => {
        const response = await fetch(pageUrl, req);
        if (!response.ok) {
            throw "Invalid response encountered";
        }

        const data = await parse(response);
        if (!data.hasOwnProperty("results")) throw "Missing results set";
        const pageResults = data.results;
        const nextUrl = data.next || null;
        if (!(pageResults instanceof Array)) throw "Invalid results set";
        results.push(...pageResults);
        if (nextUrl) await _fetchNext(nextUrl);
    };
    await _fetchNext(url);
    return results;
};


const _networkAction = (fn, ...args) => async (dispatch, getState) => {
    try {
        let fnResult = fn(...args);
        if (typeof fnResult === "function") {
            // Needs dispatch / getState, resolve those.
            fnResult = fnResult(dispatch, getState);
        }

        const {types, params, url, req, err, onSuccess, paginated} = fnResult;
        let {parse} = fnResult;
        if (!parse) parse = async r => await r.json();

        dispatch({type: types.REQUEST, ...params});
        try {
            const data = await (paginated ? _paginatedNetworkFetch : _unpaginatedNetworkFetch)(url, req, parse);
            dispatch({
                type: types.RECEIVE,
                ...params,
                ...(data === null ? {} : {data}),
                receivedAt: Date.now()
            });
            if (onSuccess) await onSuccess(data);
        } catch (e) {
            if (err) {
                console.error(e, err);
                message.error(err);
            }
            dispatch({type: types.ERROR, ...params});
        }
        dispatch({type: types.FINISH, ...params});
    } catch (e) {
        // Hit error before we even started the request - handle it to avoid crashing the page.
        console.error(e);
    }
};

// Curried version
export const networkAction = fn => (...args) => _networkAction(fn, ...args);


export const beginFlow = types => async dispatch => await dispatch({type: types.BEGIN});
export const endFlow = types => async dispatch => await dispatch({type: types.END});
export const terminateFlow = types => async dispatch => await dispatch({type: types.TERMINATE});
