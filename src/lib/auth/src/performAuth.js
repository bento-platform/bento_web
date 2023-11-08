import {useEffect} from "react";

import {PKCE_LS_STATE, PKCE_LS_VERIFIER, pkceChallengeFromVerifier, secureRandomString} from "./pkce";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useLocation} from "react-router-dom";

import {tokenHandoff} from "./redux/authSlice";
import {nop} from "./utils";
import {buildUrlEncodedData, getIsAuthenticated} from "./utils";
import {popLocalStorageItem} from "./utils";
import {AUTH_CALLBACK_URL} from "../../../config";

export const LS_BENTO_WAS_SIGNED_IN = "BENTO_WAS_SIGNED_IN";
export const LS_BENTO_POST_AUTH_REDIRECT = "BENTO_POST_AUTH_REDIRECT";

export const createAuthURL = async (authorizationEndpoint, clientId, authCallbackURL,  scope = "openid email") => {
    console.log("createAuthURL  called")
    const state = secureRandomString();
    const verifier = secureRandomString();

    localStorage.setItem(PKCE_LS_STATE, state);
    localStorage.setItem(PKCE_LS_VERIFIER, verifier);

    localStorage.setItem(LS_BENTO_POST_AUTH_REDIRECT, window.location.pathname);

    return `${authorizationEndpoint}?` + buildUrlEncodedData({
        response_type: "code",
        client_id: clientId,
        state,
        scope,
        redirect_uri: authCallbackURL,
        code_challenge: await pkceChallengeFromVerifier(verifier),
        code_challenge_method: "S256",
    }).toString();
};

const DEFAULT_REDIRECT = "/overview";

export const performAuth = async (authorizationEndpoint, clientId, authCallbackURL,  scope = "openid email") => {
    window.location = await createAuthURL(authorizationEndpoint, clientId, authCallbackURL, scope);
};

const defaultAuthCodeCallback = async (dispatch, history, code, verifier, onSuccessfulAuthentication, CLIENT_ID, AUTH_CALLBACK_URL) => {
    const lastPath = popLocalStorageItem(LS_BENTO_POST_AUTH_REDIRECT);
    await dispatch(tokenHandoff({code, verifier, CLIENT_ID, AUTH_CALLBACK_URL}));
    history.replace(lastPath ?? DEFAULT_REDIRECT);
    await dispatch(onSuccessfulAuthentication(nop));
};

export const setLSNotSignedIn = () => {
    localStorage.removeItem(LS_BENTO_WAS_SIGNED_IN);
};

export const useHandleCallback = (callbackPath, onSuccessfulAuthentication, CLIENT_ID, AUTH_CALLBACK_URL, authCodeCallback = undefined) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const oidcConfig = useSelector(state => state.openIdConfiguration.data);
    const idTokenContents = useSelector(state => state.auth.idTokenContents);
    const isAuthenticated = getIsAuthenticated(idTokenContents);

    useEffect(() => {
        // Ignore non-callback URLs
        if (!location.pathname.startsWith(callbackPath)) return;

        // End early if we don't have OpenID config (yet)
        if (!oidcConfig) return;

        // If we're already authenticated, don't try to reauthenticate
        if (isAuthenticated) {
            history.replace(DEFAULT_REDIRECT);
            return;
        }

        const params = new URLSearchParams(window.location.search);

        const error = params.get("error");
        if (error) {
            console.error(error);
            setLSNotSignedIn();
            return;
        }

        const code = params.get("code");
        if (!code) {
            // No code, don't do anything
            setLSNotSignedIn();
            return;
        }

        const localState = popLocalStorageItem(PKCE_LS_STATE);
        if (!localState) {
            console.error("no local state");
            setLSNotSignedIn();
            return;
        }

        const paramState = params.get("state");
        if (localState !== paramState) {
            console.error("state mismatch");
            setLSNotSignedIn();
            return;
        }

        const verifier = popLocalStorageItem(PKCE_LS_VERIFIER);

        (authCodeCallback ?? defaultAuthCodeCallback)(dispatch, history, code, verifier, onSuccessfulAuthentication, CLIENT_ID, AUTH_CALLBACK_URL).catch(err => {
            console.error(err);
            setLSNotSignedIn();
        });
    }, [location, history, oidcConfig]);
};
