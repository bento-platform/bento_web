import React from "react";
import { render } from "react-dom";

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import "antd/es/message/style/css";
import '@ant-design/compatible/assets/index.css';

import App from "./components/App";
import { store } from "./store";

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    render(
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>,
        root,
    );
});
