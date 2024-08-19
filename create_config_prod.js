const siteConfig = {
    BENTO_URL: process.env.BENTO_URL || null,
    BENTO_PUBLIC_URL: process.env.BENTO_PUBLIC_URL || null,
    BENTO_CBIOPORTAL_ENABLED: ["true", "1", "yes"].includes((process.env.BENTO_CBIOPORTAL_ENABLED || "").toLowerCase()),
    BENTO_CBIOPORTAL_PUBLIC_URL: process.env.BENTO_CBIOPORTAL_PUBLIC_URL || null,
    BENTO_MONITORING_ENABLED: ["true", "1", "yes"].includes((process.env.BENTO_MONITORING_ENABLED || "").toLowerCase()),
    CUSTOM_HEADER: (process.env.CUSTOM_HEADER || "").trim(),

    // OAuth/OIDC stuff
    CLIENT_ID: process.env.CLIENT_ID || null,
    OPENID_CONFIG_URL: process.env.OPENID_CONFIG_URL || null,
    AUTH_CALLBACK_URL: process.env.AUTH_CALLBACK_URL || null,
    IDP_BASE_URL: process.env.IDP_BASE_URL || null,

    BENTO_DROP_BOX_FS_BASE_PATH: process.env.BENTO_DROP_BOX_FS_BASE_PATH || null,
};

if (typeof require !== "undefined" && require.main === module) {
    process.stdout.write(`BENTO_WEB_CONFIG = ${JSON.stringify(siteConfig, null, 2)};\n`);
}

module.exports = {
    siteConfig,
};
