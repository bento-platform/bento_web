import React from "react";
import { useDispatch } from "react-redux";
import { setConfig } from "./redux/configSlice";

const AuthProvider = ({ AUTH_CALLBACK_URL, CLIENT_ID, OPENID_CONFIG_URL, children }) => {
    const dispatch = useDispatch();
    dispatch(setConfig({ AUTH_CALLBACK_URL, CLIENT_ID, OPENID_CONFIG_URL }));
    return <>{children}</>;
};

export default AuthProvider;
