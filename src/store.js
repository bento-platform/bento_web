import { configureStore } from "@reduxjs/toolkit";
import thunkMiddleware from "redux-thunk";

import { LS_OPENID_CONFIG_KEY } from "bento-auth-js";

import { readFromLocalStorage, writeToLocalStorage } from "./utils/localStorageUtils";
import rootReducer from "./reducers";

// The Immutability Middleware is only present in DEV builds.
// These options prevent delay warnings caused by large states in DEV mode by increasing the warning delay.
// See Redux Toolkit doc: https://redux-toolkit.js.org/api/getDefaultMiddleware#development
const IMMUTABILITY_OPTIONS = {
    immutableCheck: {
        // Default is 32ms
        warnAfter: 128,
    },
    serializableCheck: false,
};

const persistedState = {};
const persistedOpenIDConfig = readFromLocalStorage(LS_OPENID_CONFIG_KEY);
if (persistedOpenIDConfig) {
    console.debug("attempting to load OpenID configuration from localStorage");
    persistedState.openIdConfiguration = persistedOpenIDConfig;
}

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(IMMUTABILITY_OPTIONS).concat(thunkMiddleware),
    preloadedState: persistedState,
});

/**
 * Custom observeStore utility for enhanced 'store.subscribe' behaviour.
 *
 * The 'store.subscribe' method has no notion of previous/next state, so it is triggered on
 * every action, which leads to unnecessary subscriber executions.
 *
 * The onChange callback is only invoked if a change is detected on the selected state.
 *
 * See Redux store.subscribe doc: https://redux.js.org/api/store#subscribelistener
 *
 * @param {*} store The Redux store
 * @param {(state) => any} select A state selection function
 * @param {(currentState) => void} onChange Callback used when selected state changes
 */
const observeStore = (store, select, onChange) => {
    let currentState;

    const handleChange = () => {
        const nextState = select(store.getState());
        if (nextState !== currentState) {
            currentState = nextState;
            onChange(currentState);
        }
    };

    const unsubscribe = store.subscribe(handleChange);
    handleChange();
    return unsubscribe;
};

observeStore(
    store,
    (state) => state.openIdConfiguration,
    (currentState) => {
        const { data, expiry, isFetching } = currentState;
        if (data && expiry && !isFetching) {
            writeToLocalStorage(LS_OPENID_CONFIG_KEY, { data, expiry, isFetching });
        }
    },
);
