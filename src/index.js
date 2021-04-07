import React from "react";
import {render} from "react-dom";

import {applyMiddleware, createStore, compose} from "redux";
import thunkMiddleware from "redux-thunk";

import {Provider} from "react-redux";

import {BrowserRouter} from "react-router-dom";

import "antd/es/message/style/css";

import App from "./components/App";
import rootReducer from "./reducers";
import {POPUP_AUTH_CALLBACK_URL} from "./constants";

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunkMiddleware)));

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");

    // Handle auth popup callback
    if (window.location.href === `${process.env.CHORD_URL}${POPUP_AUTH_CALLBACK_URL}` && window.opener) {
        render(<div>Loading...</div>, root);

        // We're inside a popup window which has (presumably) successfully
        // re-authenticated the user, meaning we need to close ourself to return
        // focus to the original window.
        window.opener.postMessage("done", (new URL(process.env.CHORD_URL)).origin);
        console.log("tried to send message to ", (new URL(process.env.CHORD_URL)).origin);
        // TODO: Do we need to pass the Set-Cookie header here?
        // window.close();
    } else {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </Provider>,
            root
        );
    }
});
