import fetch from "cross-fetch";

import { message } from "antd";

import { BENTO_PUBLIC_URL, BENTO_URL, IDP_BASE_URL } from "@/config";

export { basicAction } from "./actions/basic";
export { createFlowActionTypes, beginFlow, endFlow, terminateFlow } from "./actions/flow";
export { createNetworkActionTypes } from "./actions/network";

const _unpaginatedNetworkFetch = async (url, _baseUrl, req, parse) => {
  const response = await fetch(url, req);
  if (!response.ok) {
    const errorData = await parse(response);
    const errorsArray = errorData.errors ?? [];
    throw new Error(errorData.message || `${response.status} ${response.statusText}`, { cause: errorsArray });
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
      } catch (e) {
        console.error("Invalid response encountered. Response:", e);
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

    const {
      types, // Network action types
      check, // Optional check function for whether to dispatch the action
      params, // Action parameters
      url, // Network request URL
      baseUrl, // Optional base URL for next page (paginated requests only)
      req, // Request initialization object (method, headers, etc.)
      publicEndpoint, // Whether the endpoint is public (i.e., don't include credentials, skip OPTIONS check)
      err, // Optional custom error message to display if the request fails
      onSuccess, // Optional success callback (can be sync or async)
      onError, // Optional error callback (can be sync or async)
      paginated, // Whether the response data is in a Django-style paginated format.
    } = fnResult;

    // if we're currently auto-authenticating, don't start any network requests; otherwise, they have a good
    // chance of getting interrupted when the auth redirect happens.
    if (getState().auth.isAutoAuthenticating) return;

    // if a check function is specified and evaluates to false on the state, don't fire the action.
    if (check && !check(getState())) return;

    // Only include access token when we are making a request to this Bento node or the IdP!
    // Otherwise, we could leak it to external sites.

    const token = publicEndpoint
      ? null
      : url.startsWith("/") ||
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
      const data = await (paginated ? _paginatedNetworkFetch : _unpaginatedNetworkFetch)(url, baseUrl, finalReq, parse);
      dispatch({
        type: types.RECEIVE,
        ...params,
        ...(data === null ? {} : { data }),
        receivedAt: new Date().getTime(), // UTC timestamp
      });
      if (onSuccess) await onSuccess(data);
    } catch (e) {
      handleNetworkErrorMessaging(getState(), e, err);
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

const handleNetworkErrorMessaging = (state, e, reduxErrDetail) => {
  // if we're currently auto-authenticating, and it's a network error, suppress it.
  if (e.toString().includes("NetworkError when attempting") && state.auth.isAutoAuthenticating) {
    return;
  }

  console.error(e, reduxErrDetail);

  // prefer any cause messages to the top-level "message" string
  if (e.cause && e.cause.length) {
    const errorDetails = e.cause.map((c) => c.message ?? "");
    errorDetails.forEach((ed) => {
      message.error(formatErrorMessage(reduxErrDetail, ed));
    });
  } else {
    message.error(formatErrorMessage(reduxErrDetail, e.message));
  }
};

const formatErrorMessage = (errorMessageIntro, errorDetail) => {
  return errorMessageIntro ? errorMessageIntro + (errorDetail ? `: ${errorDetail}` : "") : errorDetail;
};
