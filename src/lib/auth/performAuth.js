import {message} from "antd";

import {AUTH_CALLBACK_URL, CLIENT_ID} from "../../config";
import {PKCE_LS_STATE, PKCE_LS_VERIFIER, pkceChallengeFromVerifier, secureRandomString} from "./pkce";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useLocation} from "react-router-dom";

import {fetchUserDependentData, tokenHandoff} from "../../modules/auth/actions";
import {withBasePath} from "../../utils/url";
import {nop} from "../../utils/misc";
import {useEffect} from "react";

export const LS_BENTO_WAS_SIGNED_IN = "BENTO_WAS_SIGNED_IN";

export const performAuth = async (authorizationEndpoint, scope = "openid email") => {
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
        redirect_uri: AUTH_CALLBACK_URL,
        code_challenge: challenge,
        code_challenge_method: "S256",
    }).forEach(([k, v]) => authParams.set(k, v));

    window.location = `${authorizationEndpoint}?${authParams.toString()}`; // TODO;
};

const CALLBACK_PATH = withBasePath("/callback");
export const useHandleCallback = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const oidcConfig = useSelector(state => state.openIdConfiguration.data);

    useEffect(() => {
        if (!location.pathname.startsWith(CALLBACK_PATH)) {
            // Ignore non-callback URLs
            return;
        }

        if (!oidcConfig) {
            // We don't have OpenID config (yet)
            return;
        }

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
        (async () => {
            await dispatch(tokenHandoff(code, verifier));
            history.replace(withBasePath("/overview"));
            await dispatch(fetchUserDependentData(nop));
        })();
    }, [location, history, oidcConfig]);
};
