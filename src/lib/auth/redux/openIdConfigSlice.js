import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async actions using createAsyncThunk
export const fetchOpenIdConfiguration = createAsyncThunk(
    "openIdConfig/fetchOpenIdConfiguration",
    async ({ openIdConfigUrl }) => {
        const response = await fetch(openIdConfigUrl);
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Could not fetch identity provider configuration");
        }
    },
    {
        condition: (_, { getState }) => {
            const { isFetching, data, expiry } = getState().openIdConfiguration;
            return !isFetching && (!data || !expiry || Date.now() > expiry * 1000);
        },
    }
);

const initialState = {
    isFetching: false,
    data: null,
    expiry: null,
};

export const openIdConfigSlice = createSlice({
    name: "openIdConfiguration",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchOpenIdConfiguration.pending, (state) => {
            state.isFetching = true;
        });
        builder.addCase(fetchOpenIdConfiguration.fulfilled, (state, { payload }) => {
            state.isFetching = false;
            state.data = payload;
            state.expiry = Date.now() / 1000 + 3 * 60 * 60; // Cache for 3 hours
        });
        builder.addCase(fetchOpenIdConfiguration.rejected, (state) => {
            state.isFetching = false;
            state.data = null;
            state.expiry = null;
        });
    },
});

export const {} = openIdConfigSlice.actions;
export default openIdConfigSlice.reducer;
