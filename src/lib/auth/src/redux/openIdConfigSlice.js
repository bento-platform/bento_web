import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { OPENID_CONFIG_URL } from "../../../../config";

// Async actions using createAsyncThunk
export const fetchOpenIdConfiguration = createAsyncThunk(
    "openIdConfig/fetchOpenIdConfiguration",
    async (_args, { getState }) => {
        const { isFetching, data: existingData, expiry } = getState().openIdConfiguration;
        if (isFetching || (!!existingData && expiry && Date.now() < expiry * 1000)) return;

        const response = await fetch(OPENID_CONFIG_URL);
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Could not fetch identity provider configuration");
        }
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
        builder.addCase(fetchOpenIdConfiguration.fulfilled, (state, action) => {
            state.isFetching = false;
            state.data = action.payload;
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
