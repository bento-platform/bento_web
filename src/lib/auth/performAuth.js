import {message} from "antd";

import {CLIENT_ID} from "../../config";
import {PKCE_LS_STATE, PKCE_LS_VERIFIER, pkceChallengeFromVerifier, secureRandomString} from "./pkce";
import {useDispatch, useSelector} from "react-redux";
import {accessTokenHandoff} from "../../modules/auth/actions";

const performAuth = async (authorizationEndpoint, scope = "openid email") => {
    const state = secureRandomString();
    const verifier = secureRandomString();
    const challenge = await pkceChallengeFromVerifier(verifier);

    localStorage.setItem(PKCE_LS_STATE, state);
    localStorage.setItem(PKCE_LS_VERIFIER, verifier);

    const authParams = new URLSearchParams();

    Object.entries({
        response_type: "code",
        client_id: CLIENT_ID,
        state,
        scope,
        redirect_uri: "/callback",
        code_challenge: challenge,
        code_challenge_method: "S256",
    }).forEach(([k, v]) => authParams.set(k, v));

    window.location = `${authorizationEndpoint}?${authParams.toString()}`; // TODO;
};

const useHandleCallback = (callbackPath) => {
    const dispatch = useDispatch();
    const oidcConfig = useSelector(state => state.openIdConfiguration.data);

    if (!window.location.pathname.startsWith(callbackPath)) {
        // Ignore non-callback URLs
        return;
    }

    if (!oidcConfig) {
        // We don't have OpenID config (yet)
        return;
    }

    const {token_endpoint: tokenEndpoint} = oidcConfig;

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

    const paramState = params.get("state");
    if (localState !== paramState) {
        message.error(`Error encountered during sign-in: state mismatch`);
        console.error("state mismatch");
        return;
    }

    const verifier = localStorage.getItem(PKCE_LS_VERIFIER);

    // TODO: dispatch token getter

    const handoffBody = new URLSearchParams();
    Object.entries({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        redirect_uri: "/callback",
        code_verifier: verifier,
    }).forEach(([k, v]) => handoffBody.set(k, v));
    dispatch(accessTokenHandoff(tokenEndpoint, handoffBody));
};

export default performAuth;
