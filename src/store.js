import { configureStore } from "@reduxjs/toolkit";
import { readFromLocalStorage, writeToLocalStorage } from "./utils/localStorageUtils";
import rootReducer from "./reducers";
import thunkMiddleware from "redux-thunk";

const LS_OPENID_CONFIG_KEY = "BENTO_OPENID_CONFIG";

const persistedState = {};
const persistedOpenIDConfig = readFromLocalStorage(LS_OPENID_CONFIG_KEY);
if (persistedOpenIDConfig) {
    console.debug("attempting to load OpenID configuration from localStorage");
    persistedState.openIdConfiguration = persistedOpenIDConfig;
}

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunkMiddleware),
    preloadedState: persistedState,
});

store.subscribe(() => {
    // noinspection JSUnresolvedReference
    const { data, expiry, isFetching } = store.getState().openIdConfiguration;
    if (data && expiry && !isFetching) {
        writeToLocalStorage(LS_OPENID_CONFIG_KEY, { data, expiry, isFetching });
    }
});
