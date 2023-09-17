import { createSlice} from "@reduxjs/toolkit";

export const configSlice = createSlice({
    name: "config",
    initialState: {
        CLIENT_ID: "",
        AUTH_CALLBACK_URL: "",
        OPENID_CONFIG_URL: "",
    },
    reducers: {
        setConfig: (state, action) => {
            state.CLIENT_ID = action.payload.CLIENT_ID;
            state.AUTH_CALLBACK_URL = action.payload.AUTH_CALLBACK_URL;
            state.OPENID_CONFIG_URL = action.payload.OPENID_CONFIG_URL;
        }
    },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;