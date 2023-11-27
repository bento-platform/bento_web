import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { decodeJwt } from "jose";

import { buildUrlEncodedData } from "../utils";
import { LS_BENTO_WAS_SIGNED_IN, setLSNotSignedIn } from "../performAuth";
import { makeResourceKey } from "../resources";

export const tokenHandoff = createAsyncThunk(
    "auth/TOKEN_HANDOFF",
    async ({ code, verifier, clientId, authCallbackUrl }, { getState }) => {
        const url = getState().openIdConfiguration.data?.["token_endpoint"];

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: buildUrlEncodedData({
                grant_type: "authorization_code",
                code,
                client_id: clientId,
                redirect_uri: authCallbackUrl,
                code_verifier: verifier,
            }),
        });

        // Assuming the server responds with JSON
        return await response.json();
    }
);

export const refreshTokens = createAsyncThunk(
    "auth/REFRESH_TOKENS",
    async ({ clientId }, { getState }) => {
        const url = getState().openIdConfiguration.data["token_endpoint"];

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getState().auth.accessToken}`,
            },
            body: buildUrlEncodedData({
                grant_type: "refresh_token",
                client_id: clientId,
                refresh_token: getState().auth.refreshToken,
            }),
        });

        // Assuming the server responds with JSON
        return await response.json();
    },
    {
        condition: (_, { getState }) => {
            const { auth, openIdConfiguration } = getState();
            if (!openIdConfiguration.data?.["token_endpoint"]) {
                console.error("No token endpoint available/No openIdConfiguration data");
                return false;
            }
            const { isRefreshingTokens, refreshToken } = auth;
            return !isRefreshingTokens && refreshToken;
        },
    }
);

export const fetchResourcePermissions = createAsyncThunk(
    "auth/FETCH_RESOURCE_PERMISSIONS",
    async ({ resource, authUrl }, { getState }) => {
        const url = `${authUrl}/policy/permissions`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${getState().auth.accessToken}` },
            body: JSON.stringify({ resources: resource }),
        });
        return await response.json();
    },
    {
        condition: ({ resource, authUrl }, { getState }) => {
            const key = makeResourceKey(resource);
            const rp = getState().auth.resourcePermissions[key];
            return !rp?.isFetching;
        },
    }
);

const nullSession = {
    sessionExpiry: null,
    idToken: null,
    idTokenContents: null,
    accessToken: null,
    refreshToken: null,
};

const initialState = {
    hasAttempted: false,

    isHandingOffCodeForToken: false,
    handoffError: "",

    isRefreshingTokens: false,
    tokensRefreshError: "",

    // Below is token/token-derived data

    sessionExpiry: null,
    idToken: null,
    idTokenContents: null,

    //  - NEVER dehydrate the below items to localStorage; it is a security risk!
    accessToken: null,
    refreshToken: null,

    // Below is permissions caching for controlling how the UI appears for different resources
    //  - It's in this reducer since signing out / losing a token will clear permissions caches.
    resourcePermissions: {},
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        signOut: (state) => {
            setLSNotSignedIn();
            state = {
                ...state,
                ...nullSession,
                tokensRefreshError: "",
                resourcePermissions: {},
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(tokenHandoff.pending, (state) => {
                state.isHandingOffCodeForToken = true;
            })
            .addCase(tokenHandoff.fulfilled, (state, { payload }) => {
                state.loading = false;
                const {
                    access_token: accessToken,
                    expires_in: exp,
                    id_token: idToken,
                    refresh_token: refreshToken,
                } = payload;

                // Reset hasAttempted for user-dependent data if we just signed in
                state.hasAttempted = !state.idTokenContents && idToken ? false : state.hasAttempted;
                state.sessionExpiry = new Date().getTime() / 1000 + exp;
                state.idToken = idToken;
                state.idTokenContents = decodeJwt(idToken);
                state.accessToken = accessToken;
                state.refreshToken = refreshToken ?? state.refreshToken;
                state.isHandingOffCodeForToken = false;
                localStorage.setItem(LS_BENTO_WAS_SIGNED_IN, "true");
            })
            .addCase(tokenHandoff.rejected, (state, { payload, error: errorProp }) => {
                errorProp && console.error(errorProp);
                let handoffError = errorProp.message ?? "Error handing off authorization code for token";

                const { error, error_description: errorDesc } = payload.data ?? {};
                if (error) {
                    handoffError = `${error}: ${errorDesc}`;
                }
                console.error(handoffError);
                state.handoffError = handoffError;
                state.resourcePermissions = {};

                Object.keys(nullSession).forEach((key) => {
                    state[key] = nullSession[key];
                });

                state.loading = false;
                state.isHandingOffCodeForToken = false;
                setLSNotSignedIn();
            })
            .addCase(refreshTokens.pending, (state) => {
                state.isRefreshingTokens = true;
            })
            .addCase(refreshTokens.fulfilled, (state, { payload }) => {
                if (payload) {
                    const {
                        access_token: accessToken,
                        expires_in: exp,
                        id_token: idToken,
                        refresh_token: refreshToken,
                    } = payload;

                    state.sessionExpiry = new Date().getTime() / 1000 + exp;
                    state.idToken = idToken;
                    state.idTokenContents = decodeJwt(idToken);
                    state.accessToken = accessToken;
                    state.refreshToken = refreshToken ?? state.refreshToken;
                    state.isRefreshingTokens = false;
                    localStorage.setItem(LS_BENTO_WAS_SIGNED_IN, "true");
                }
            })
            .addCase(refreshTokens.rejected, (state, { payload, error: errorProp }) => {
                if (errorProp) console.error(errorProp);
                const { error, error_description: errorDesc } = payload.data ?? {};
                const tokensRefreshError = error
                    ? `${error}: ${errorDesc}`
                    : errorProp.message ?? "Error refreshing tokens";
                console.error(tokensRefreshError);
                state.tokensRefreshError = tokensRefreshError;
                state.resourcePermissions = {};

                Object.keys(nullSession).forEach((key) => {
                    state[key] = nullSession[key];
                });

                state.isRefreshingTokens = false;
                setLSNotSignedIn();
            })
            .addCase(fetchResourcePermissions.pending, (state, { meta }) => {
                const key = makeResourceKey(meta.arg.resource);
                state.resourcePermissions[key] = {
                    ...state.resourcePermissions[key],
                    isFetching: true,
                    hasAttempted: false,
                    permissions: [],
                    error: "",
                };
            })
            .addCase(fetchResourcePermissions.fulfilled, (state, { meta, payload }) => {
                const key = makeResourceKey(meta.arg.resource);
                state.resourcePermissions[key] = {
                    ...state.resourcePermissions[key],
                    isFetching: false,
                    hasAttempted: true,
                    permissions: payload?.result ?? [],
                };
            })
            .addCase(fetchResourcePermissions.rejected, (state, { meta, payload, error }) => {
                const key = makeResourceKey(meta.arg.resource);
                if (error) console.error(error);
                state.resourcePermissions[key] = {
                    ...state.resourcePermissions[key],
                    isFetching: false,
                    hasAttempted: true,
                    error:
                        payload?.error ??
                        error.message ??
                        "An error occurred while fetching permissions for a resource",
                };
            });
    },
});

export const { signOut } = authSlice.actions;
export default authSlice.reducer;
