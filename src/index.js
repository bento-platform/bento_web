import React from "react";
import {render} from "react-dom";

import {applyMiddleware, createStore, compose} from "redux";
import thunkMiddleware from "redux-thunk";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";

import "antd/es/message/style/css";

import rootReducer from "./reducers";

import App from "./components/App";
import {readFromLocalStorage, writeToLocalStorage} from "./utils/localStorageUtils";

const LS_OPENID_CONFIG_KEY = "BENTO_OPENID_CONFIG";

const persistedState = {};
const persistedOpenIDConfig = readFromLocalStorage(LS_OPENID_CONFIG_KEY);
if (persistedOpenIDConfig) {
    console.debug("attempting to load OpenID configuration from localStorage");
    persistedState.openIdConfiguration = persistedOpenIDConfig;
}

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(rootReducer, persistedState, composeEnhancers(applyMiddleware(thunkMiddleware)));

store.subscribe(() => {
    // noinspection JSUnresolvedReference
    const {data, expiry, isFetching} = store.getState().openIdConfiguration;
    if (data && expiry && !isFetching) {
        writeToLocalStorage(LS_OPENID_CONFIG_KEY, {data, expiry, isFetching});
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    render(
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>,
        root,
    );
});
