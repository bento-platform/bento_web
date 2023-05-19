import React from "react";
import {render} from "react-dom";

import {applyMiddleware, createStore, compose} from "redux";
import thunkMiddleware from "redux-thunk";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";

import "antd/es/message/style/css";

import rootReducer from "./reducers";

import App from "./components/App";

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunkMiddleware)));

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
