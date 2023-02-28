/* global BENTO_WEB_CONFIG:false */

export const BENTO_URL = BENTO_WEB_CONFIG.BENTO_URL ?? process.env.BENTO_URL ?? process.env.CHORD_URL ?? null;
export const BENTO_CBIOPORTAL_ENABLED = BENTO_WEB_CONFIG.BENTO_CBIOPORTAL_ENABLED
    ?? process.env.BENTO_CBIOPORTAL_ENABLED ?? false;
export const CUSTOM_HEADER = BENTO_WEB_CONFIG.CUSTOM_HEADER ?? process.env.CUSTOM_HEADER ?? null;
