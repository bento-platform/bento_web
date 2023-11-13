import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildUrlEncodedData } from "../utils";
import { LS_BENTO_WAS_SIGNED_IN, setLSNotSignedIn } from "../performAuth";
import { decodeJwt } from "jose";
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

export const refreshTokens = createAsyncThunk("auth/REFRESH_TOKENS", async ({ clientId }, { getState }) => {
    if (!getState().auth.refreshToken) return;

    const url = getState().openIdConfiguration.data?.["token_endpoint"];

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: buildUrlEncodedData({
            grant_type: "refresh_token",
            client_id: clientId,
            refresh_token: getState().auth.refreshToken,
        }),
    });

    // Assuming the server responds with JSON
    return await response.json();
});

export const fetchResourcePermissions = createAsyncThunk(
    "auth/FETCH_RESOURCE_PERMISSIONS",
    async ({ resource }, thunkAPI) => {
        if (!thunkAPI.getState().services.itemsByKind.authorization?.url) {
            console.error("Missing authorization service");
            return;
        }
        const key = makeResourceKey(resource);
        const rp = thunkAPI.getState().auth.resourcePermissions[key];
        if (rp?.isFetching || rp?.permissions) {
            return;
        }
        // TODO: ask for it
        const url = `${thunkAPI.getState().services.itemsByKind.authorization.url}/policy/permissions`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requested_resource: resource }),
        });
        return await response.json();
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
            .addCase(tokenHandoff.rejected, (state, { payload }) => {
                let handoffError = "Error handing off authorization code for token";

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
            .addCase(refreshTokens.rejected, (state, { payload }) => {
                const { error, error_description: errorDesc } = payload.data ?? {};
                const tokensRefreshError = error
                    ? `${error}: ${errorDesc}`
                    : `An error occurred while refreshing tokens: ${action.caughtError ?? "Unknown error"}`;
                console.error(tokensRefreshError);
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
                if (payload) {
                    const key = makeResourceKey(meta.arg.resource);
                    state.resourcePermissions[key] = {
                        ...state.resourcePermissions[key],
                        isFetching: false,
                        hasAttempted: true,
                        permissions: payload?.result ?? [],
                    };
                }
            })
            .addCase(fetchResourcePermissions.rejected, (state, { meta, payload }) => {
                const key = makeResourceKey(meta.arg.resource);
                state.resourcePermissions[key] = {
                    ...state.resourcePermissions[key],
                    isFetching: false,
                    hasAttempted: true,
                    error: payload?.error ?? "An error occurred while fetching permissions for a resource",
                };
            });
    },
});

export const { signOut } = authSlice.actions;
export default authSlice.reducer;
