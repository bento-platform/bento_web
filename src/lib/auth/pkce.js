// Adapted from https://developer.okta.com/blog/2019/05/01/is-the-oauth-implicit-flow-dead

export const PKCE_LS_PREFIX = "pkce";
export const PKCE_LS_STATE = `${PKCE_LS_PREFIX}_state`;
export const PKCE_LS_VERIFIER = `${PKCE_LS_PREFIX}_verifier`;

/**
 * Create an array of securely random values
 * @param {number} length The number of Uint32s to use for creating the random string.
 * @return {string} A securely randomly-generated string of characters in the hex alphanumeric representation range.
 */
export const secureRandomString = (length = 32) =>
    Array.from(
        crypto.getRandomValues(new Uint32Array(length)),
        v => ("0" + v.toString(16)).slice(-2)  // Prepend with 0 to prevent slice from yielding only 1 char
    ).join("");

/**
 * Generates a SHA256 hash of a given string.
 * @param {string} v The string to calculate the hash for.
 * @return {Promise<ArrayBuffer>} A promise yielding the array buffer with the bytes of the hash.
 */
const textSHA256 = v => crypto.subtle.digest("SHA-256", (new TextEncoder()).encode(v));

/**
 * Create a URL-safe base-64 representation of a cryptographic hash
 * @param {ArrayBuffer} v The array buffer containing the bytes of a cryptographic hash.
 * @return {string} The URL-safe base-64 representation of a cryptographic hash
 */
const b64URLEncode = v =>
    btoa(String.fromCharCode.apply(null, new Uint8Array(v)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

/**
 * Create a PKCE (proof key for code exchange) challenge from a given securely randomly-generated string.
 * @param {string} v The verifier to generate the challenge from.
 * @return {Promise<string>} A promise yielding the challenge string.
 */
export const pkceChallengeFromVerifier = async v => b64URLEncode(await textSHA256(v));
