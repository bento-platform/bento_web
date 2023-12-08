import fetch from "cross-fetch";

import { message } from "antd";

import { BENTO_PUBLIC_URL, BENTO_URL, IDP_BASE_URL } from "../config";

export const basicAction = (t) => () => ({ type: t });

export const createNetworkActionTypes = (name) => ({
    REQUEST: `${name}.REQUEST`,
    RECEIVE: `${name}.RECEIVE`,
    ERROR: `${name}.ERROR`,
    FINISH: `${name}.FINISH`,
});

export const createFlowActionTypes = (name) => ({
    BEGIN: `${name}.BEGIN`,
    END: `${name}.END`,
    TERMINATE: `${name}.TERMINATE`,
});

const _unpaginatedNetworkFetch = async (url, _baseUrl, req, parse) => {
    const response = await fetch(url, req);
    if (!response.ok) {
        const errorData = await parse(response);
        throw new Error(errorData.message || `${response.status} ${response.statusText}`);
    }
    return response.status === 204 ? null : await parse(response);
};

const _paginatedNetworkFetch = async (url, baseUrl, req, parse) => {
    const results = [];
    const _fetchNext = async (pageUrl) => {
        const response = await fetch(pageUrl, req);
        if (!response.ok) {
            try {
                const errorData = await parse(response);
                throw new Error(errorData.message);
            } catch (_) {
                throw new Error("Invalid response encountered");
            }
        }

        const data = await parse(response);
        if (!data.hasOwnProperty("results")) throw "Missing results set";
        const pageResults = data.results;
        const nextUrl = data.next ? baseUrl + data.next : null;
        if (!(pageResults instanceof Array)) throw "Invalid results set";
        results.push(...pageResults);
        if (nextUrl) await _fetchNext(nextUrl);
    };
    await _fetchNext(url);
    return results;
};

const _networkAction =
    (fn, ...args) =>
        async (dispatch, getState) => {
            let fnResult = await fn(...args);
            if (typeof fnResult === "function") {
            // Needs dispatch / getState, resolve those.
                fnResult = await fnResult(dispatch, getState);
            }

            const { types, params, url, baseUrl, req, err, onSuccess, onError, paginated } = fnResult;

            // Only include access token when we are making a request to this Bento node or the IdP!
            // Otherwise, we could leak it to external sites.

            const token =
            url.startsWith("/") ||
            (BENTO_URL && url.startsWith(BENTO_URL)) ||
            (BENTO_PUBLIC_URL && url.startsWith(BENTO_PUBLIC_URL)) ||
            (IDP_BASE_URL && url.startsWith(IDP_BASE_URL))
                ? getState().auth.accessToken
                : null;

            const finalReq = {
                ...(req ?? {
                    method: "GET", // Default request method
                }),
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...(req?.headers ?? {}),
                },
            };

            let { parse } = fnResult;
            if (!parse) parse = (r) => r.json();

            dispatch({ type: types.REQUEST, ...params });
            try {
                const data = await (paginated ? _paginatedNetworkFetch : _unpaginatedNetworkFetch)(
                    url,
                    baseUrl,
                    finalReq,
                    parse,
                );
                dispatch({
                    type: types.RECEIVE,
                    ...params,
                    ...(data === null ? {} : { data }),
                    receivedAt: Date.now(),
                });
                if (onSuccess) await onSuccess(data);
            } catch (e) {
                const errorMsg = err ? (err + (e.message ? `: ${e.message}` : "") ) : e.message;
                console.error(e, errorMsg);
                message.error(errorMsg);
                dispatch({ type: types.ERROR, ...params, caughtError: e });
                if (onError) await onError(e);
            }
            dispatch({ type: types.FINISH, ...params });
        };

// Curried version
export const networkAction =
    (fn) =>
        (...args) =>
            _networkAction(fn, ...args);

export const beginFlow = (types) => async (dispatch) => await dispatch({ type: types.BEGIN });
export const endFlow = (types) => async (dispatch) => await dispatch({ type: types.END });
export const terminateFlow = (types) => async (dispatch) => await dispatch({ type: types.TERMINATE });
