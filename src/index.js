import React from "react";
import { render } from "react-dom";

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { BentoAuthContextProvider } from "bento-auth-js";

import "antd/es/message/style/css";
import "react18-json-view/src/style.css";
import "@/styles/react18_json_viewer.css";

import { AUTH_CALLBACK_URL, BENTO_URL_NO_TRAILING_SLASH, CLIENT_ID, OPENID_CONFIG_URL } from "./config";
import App from "./components/App";
import { store } from "./store";

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    render(
        <Provider store={store}>
            <BrowserRouter>
                <BentoAuthContextProvider value={{
                    applicationUrl: BENTO_URL_NO_TRAILING_SLASH,
                    openIdConfigUrl: OPENID_CONFIG_URL,
                    clientId: CLIENT_ID,
                    scope: "openid email",
                    postSignOutUrl: `${BENTO_URL_NO_TRAILING_SLASH}/`,
                    authCallbackUrl: AUTH_CALLBACK_URL,
                }}>
                    <App />
                </BentoAuthContextProvider>
            </BrowserRouter>
        </Provider>,
        root,
    );
});
