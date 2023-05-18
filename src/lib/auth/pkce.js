// Adapted from https://developer.okta.com/blog/2019/05/01/is-the-oauth-implicit-flow-dead

export const PKCE_LS_PREFIX = "pkce";
export const PKCE_LS_STATE = `${PKCE_LS_PREFIX}_state`;
export const PKCE_LS_VERIFIER = `${PKCE_LS_PREFIX}_verifier`;

export const secureRandomString = (length = 32) => {
    const randomArray = crypto.getRandomValues(new Uint32Array(length));  // Create an array of securely random values
    // Prepend with 0 to prevent substr from yielding only 1 character
    return Array.from(randomArray, v => ("0" + v.toString(16)).slice(-2)).join("");
};

const textSHA256 = v =>
    crypto.subtle.digest("SHA-256", (new TextEncoder()).encode(v));

const b64URLEncode = v =>
    btoa(String.fromCharCode.apply(null, new Uint8Array(v)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

export const pkceChallengeFromVerifier = async v => b64URLEncode(await textSHA256(v));
