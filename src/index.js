import React from "react";
import { render } from "react-dom";

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import "antd/es/message/style/css";

import App from "./components/App";
import { store } from "./store";
import AuthProviderInitialised from "./components/AuthProviderInitialised";

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    render(
        <Provider store={store}>
            <AuthProviderInitialised>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthProviderInitialised>
        </Provider>,
        root
    );
});
