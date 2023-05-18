import React from "react";
import {render} from "react-dom";

import {applyMiddleware, createStore, compose} from "redux";
import thunkMiddleware from "redux-thunk";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";

import "antd/es/message/style/css";

import {BENTO_URL} from "./config";
import {POPUP_AUTH_CALLBACK_URL} from "./constants";
import rootReducer from "./reducers";

import App from "./components/App";

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunkMiddleware)));

const BENTO_URL_WITH_TRAILING_SLASH = BENTO_URL ? (BENTO_URL.endsWith("/") ? BENTO_URL : `${BENTO_URL}/`) : null;

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");

    // Fall back to checking path name if the front-end was built without CHORD_URL set
    // TODO: Use url.js base path for this? Do we care about the host?
    const isPopupAuthCallback = BENTO_URL
        ? window.location.href.startsWith(`${BENTO_URL_WITH_TRAILING_SLASH}${POPUP_AUTH_CALLBACK_URL}`)
        : window.location.pathname.includes(`/${POPUP_AUTH_CALLBACK_URL}`);  // TODO: Can we only use the fallback?

    // Handle auth popup callback
    if (isPopupAuthCallback && window.opener) {
        render(<div>Loading...</div>, root);

        // We're inside a popup window which has (presumably) successfully
        // re-authenticated the user, meaning we need to close ourselves to return
        // focus to the original window.
        window.close();
    } else {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </Provider>,
            root,
        );
    }
});

