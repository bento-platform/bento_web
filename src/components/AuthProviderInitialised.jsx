import React from "react";
import AuthProvider from "../lib/auth/src/AuthProvider";
import { AUTH_CALLBACK_URL, CLIENT_ID, OPENID_CONFIG_URL } from "../config";

const AuthProviderInitialised = ({ children }) => {
    return (
        <AuthProvider AUTH_CALLBACK_URL={AUTH_CALLBACK_URL} CLIENT_ID={CLIENT_ID} OPENID_CONFIG_URL={OPENID_CONFIG_URL}>
            {children}
        </AuthProvider>
    );
};

export default AuthProviderInitialised;
