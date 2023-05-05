/* global BENTO_WEB_CONFIG:false */

export const BENTO_URL = BENTO_WEB_CONFIG.BENTO_URL ?? process.env.BENTO_URL ?? process.env.CHORD_URL ?? null;
// Use || here instead of ??: the first true value should override any previous false (which is not null-ish)
export const BENTO_CBIOPORTAL_ENABLED = BENTO_WEB_CONFIG.BENTO_CBIOPORTAL_ENABLED
    || ["true", "1", "yes"].includes(process.env.BENTO_CBIOPORTAL_ENABLED || "");
export const BENTO_CBIOPORTAL_PUBLIC_URL = BENTO_WEB_CONFIG.BENTO_CBIOPORTAL_PUBLIC_URL ??
    process.env.BENTO_CBIOPORTAL_PUBLIC_URL ?? null;
export const CUSTOM_HEADER = BENTO_WEB_CONFIG.CUSTOM_HEADER ?? process.env.CUSTOM_HEADER ?? null;

export const CLIENT_ID = BENTO_WEB_CONFIG.CLIENT_ID ?? process.env.CLIENT_ID ?? null;
export const OPENID_CONFIG_URL = BENTO_WEB_CONFIG.OPENID_CONFIG_URL
    ?? process.env.OPENID_CONFIG_URL ?? null;

export const AUTH_CALLBACK_URL = BENTO_URL.replace(/\/$/g, "") + "/callback";
export const IDP_BASE_URL = OPENID_CONFIG_URL ? (new URL(OPENID_CONFIG_URL)).origin : null;
