const siteConfig = {
    BENTO_URL: process.env.BENTO_URL || process.env.CHORD_URL || null,
    BENTO_CBIOPORTAL_ENABLED: ["true", "1", "yes"].includes((process.env.BENTO_CBIOPORTAL_ENABLED || "").toLowerCase()),
    BENTO_CBIOPORTAL_PUBLIC_URL: process.env.BENTO_CBIOPORTAL_PUBLIC_URL || null,
    CUSTOM_HEADER: (process.env.CUSTOM_HEADER || "").trim(),
};

if (typeof require !== "undefined" && require.main === module) {
    process.stdout.write(`BENTO_WEB_CONFIG = ${JSON.stringify(siteConfig, null, 2)};\n`);
}

module.exports = {
    siteConfig,
};
