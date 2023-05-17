import {useEffect} from "react";

import {message} from "antd";

import {AUTH_CALLBACK_URL, CLIENT_ID} from "../../config";
import {PKCE_LS_STATE, PKCE_LS_VERIFIER, pkceChallengeFromVerifier, secureRandomString} from "./pkce";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useLocation} from "react-router-dom";

import {fetchUserDependentData, tokenHandoff} from "../../modules/auth/actions";
import {withBasePath} from "../../utils/url";
import {nop} from "../../utils/misc";
import {buildUrlEncodedData} from "./utils";

export const LS_BENTO_WAS_SIGNED_IN = "BENTO_WAS_SIGNED_IN";
export const LS_BENTO_POST_AUTH_REDIRECT = "BENTO_POST_AUTH_REDIRECT";

export const createAuthURL = async (authorizationEndpoint, scope = "openid email") => {
    const state = secureRandomString();
    const verifier = secureRandomString();
    const challenge = await pkceChallengeFromVerifier(verifier);

    localStorage.setItem(PKCE_LS_STATE, state);
    localStorage.setItem(PKCE_LS_VERIFIER, verifier);

    localStorage.setItem(LS_BENTO_POST_AUTH_REDIRECT, window.location.pathname);

    const authParams = buildUrlEncodedData({
        response_type: "code",
        client_id: CLIENT_ID,
        state,
        scope,
        redirect_uri: AUTH_CALLBACK_URL,
        code_challenge: challenge,
        code_challenge_method: "S256",
    }).toString();
    return `${authorizationEndpoint}?${authParams}`;
};

export const performAuth = async (authorizationEndpoint, scope = "openid email") => {
    window.location = await createAuthURL(authorizationEndpoint, scope);
};

const defaultAuthCodeCallback = async (dispatch, history, code, verifier) => {
    const lastPath = localStorage.getItem(LS_BENTO_POST_AUTH_REDIRECT);
    localStorage.removeItem(LS_BENTO_POST_AUTH_REDIRECT);

    await dispatch(tokenHandoff(code, verifier));
    history.replace(withBasePath(lastPath ?? "/overview"));
    await dispatch(fetchUserDependentData(nop));
};

export const useHandleCallback = (callbackPath, authCodeCallback = undefined) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const oidcConfig = useSelector(state => state.openIdConfiguration.data);

    useEffect(() => {
        // Ignore non-callback URLs
        if (!location.pathname.startsWith(callbackPath)) return;

        // End early if we don't have OpenID config (yet)
        if (!oidcConfig) return;

        const params = new URLSearchParams(window.location.search);

        const error = params.get("error");
        if (error) {
            message.error(`Error encountered during sign-in: ${error}`);
            console.error(error);
            return;
        }

        const code = params.get("code");
        if (!code) {
            // No code, don't do anything
            return;
        }

        const localState = localStorage.getItem(PKCE_LS_STATE);
        localStorage.removeItem(PKCE_LS_STATE);

        if (!localState) {
            console.error("no local state");
            return;
        }

        const paramState = params.get("state");
        if (localState !== paramState) {
            message.error("Error encountered during sign-in: state mismatch");
            console.error("state mismatch");
            return;
        }

        const verifier = localStorage.getItem(PKCE_LS_VERIFIER);
        localStorage.removeItem(PKCE_LS_VERIFIER);

        (authCodeCallback ?? defaultAuthCodeCallback)(dispatch, history, code, verifier).catch(console.error);
    }, [location, history, oidcConfig]);
};
